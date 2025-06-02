const xlsx = require('xlsx');
const fs = require('fs-extra');
const path = require('path');

// Путь к Excel-файлу
const workbook = xlsx.readFile('./input/primer.xlsx');

// === Мапа языков ===
const langMap = {
    en: 'en-001',
    ru: 'ru-RU',
    az: 'az-Latn-AZ',
    bn: 'bn-BD',
    // cn: 'cn',
    de: 'de-DE',
    // el: 'el',
    es: 'es-ES',
    fr: 'fr-CI',
    hi: 'hi-IN',
    //'hi-lath': 'hi-Lath-IN',
    it: 'it-IT',
    kz: 'kk-KZ',
    kk: 'kk-KZ',
    ko: 'ko-KR',
    ky: 'ky-KG',
    mr: 'mr-IN',
    pl: 'pl-PL',
    pt: 'pt-BR',
    ro: 'ro-MD',
    sw: 'sw-KE',
    te: 'te-IN',
    tj: 'tg-TJ',
    tg: 'tg-TJ',
    tr: 'tr-TR',
    uk: 'uk-UA',
    ua: 'uk-UA',
    ur: 'ur-PK',
    uz: 'uz-Latn-UZ',
    vi: 'vi-VN',

};

const sheetName = workbook.SheetNames[0];
const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

const translationsDir = path.join(__dirname, 'translations');
fs.ensureDirSync(translationsDir);

const languages = Object.keys(sheet[0]).filter(col => col !== 'key' && col !== 'file')

const languageData = {};
languages.forEach(lang => languageData[lang] = {});
languages.forEach(lang => languageData[lang] = {});

sheet.forEach(row => {
    const { key, file } = row;

    if (!key || !file) return;

    languages.forEach(lang => {
        if (!languageData[lang][file]) {
            languageData[lang][file] = {}
        }

        languageData[lang][file][key] = row[lang] || '';
    });
});

languages.forEach(lang => {
    if (!langMap[lang]) {
        return
    }

    const langDir = path.join(translationsDir, langMap[lang]);

    fs.ensureDirSync(langDir);

    Object.entries(languageData[lang]).forEach( file => {
        const fileContent =
            `enum Data {
  ${Object.entries(file[1]).map(([k, v]) => `${k} = ${JSON.stringify(v)},`).join('\n  ')} 
}

export default Data;

export type DataType = typeof Data;
`;
        fs.writeFileSync(path.join(langDir, `${file[0]}.ts`), fileContent, 'utf8');
    })
});

console.log('Файлы перевода созданы в папке translations.');