import { SurahDetail, Ayah } from '../types/quran';
import { ALL_SURAHS, PRELOADED_SURAHS } from '../data/quranData';

const SURAH_CACHE_PREFIX = 'alnur_surah_cache_v1_';

export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetail> {
  // 1. Check preloaded data (instant zero-network)
  if (PRELOADED_SURAHS[surahNumber]) {
    return PRELOADED_SURAHS[surahNumber];
  }

  // 2. Check local persistent cache
  const cacheKey = `${SURAH_CACHE_PREFIX}${surahNumber}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('LocalStorage read error for surah cache:', e);
  }

  // 3. Fetch from Quran Cloud API (Arabic Uthmani + English Sahih)
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch surah (${response.status})`);
    }

    const data = await response.json();
    if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
      const arabicEdition = data.data[0];
      const englishEdition = data.data[1];

      const surahMeta = ALL_SURAHS.find((s) => s.number === surahNumber) || {
        number: surahNumber,
        name: arabicEdition.name,
        englishName: arabicEdition.englishName,
        englishNameTranslation: arabicEdition.englishNameTranslation,
        numberOfAyahs: arabicEdition.numberOfAyahs,
        revelationType: arabicEdition.revelationType,
        revelationOrder: 1,
        juz: 1,
        page: 1,
      };

      const ayahs: Ayah[] = arabicEdition.ayahs.map((arabicAyah: {
        number: number;
        numberInSurah: number;
        text: string;
        juz: number;
        page: number;
      }, index: number) => {
        const englishAyah = englishEdition.ayahs[index];
        return {
          number: arabicAyah.number,
          numberInSurah: arabicAyah.numberInSurah,
          text: arabicAyah.text,
          translation: englishAyah ? englishAyah.text : '',
          juz: arabicAyah.juz,
          page: arabicAyah.page,
        };
      });

      const detail: SurahDetail = {
        ...surahMeta,
        ayahs,
      };

      // Save to localStorage cache for offline access
      try {
        localStorage.setItem(cacheKey, JSON.stringify(detail));
      } catch (e) {
        console.warn('Storage quota reached when saving surah text:', e);
      }

      return detail;
    }
  } catch (err) {
    console.warn('Network fetch error for Surah', surahNumber, err);
  }

  // 4. Emergency graceful fallback for offline or blocked network
  const meta = ALL_SURAHS.find((s) => s.number === surahNumber);
  return {
    number: surahNumber,
    name: meta?.name || 'سورة',
    englishName: meta?.englishName || `Surah ${surahNumber}`,
    englishNameTranslation: meta?.englishNameTranslation || '',
    numberOfAyahs: meta?.numberOfAyahs || 1,
    revelationType: meta?.revelationType || 'Meccan',
    revelationOrder: meta?.revelationOrder || 1,
    juz: meta?.juz || 1,
    page: meta?.page || 1,
    ayahs: [
      {
        number: 1,
        numberInSurah: 1,
        text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        juz: 1,
        page: 1,
      },
    ],
  };
}
