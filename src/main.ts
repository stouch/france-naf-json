import ExcelJS from 'exceljs';
import fs from 'fs';

const outputFilepath = './output.json';
const outputLabelsFilepath = (depthLvl): string =>
  `./output-labels-${depthLvl}.json`;

// Nomenclature d’activités française – NAF rév. 2
// Accueil > Définitions, méthodes et qualité > Nomenclatures > Nomenclature d’activités française > Nomenclature d’activités française – NAF rév. 2
// https://www.insee.fr/fr/information/2120875
// -- Fichier : Libellés longs, courts et abrégés de tous les postes (xls)
//
// Converted file to xlsx :
const filepath = './data/int_courts_naf_rev_2.xlsx';

const beautifyLabel = (string): string => {
  let label = string.replace(/\(sf /, '(sauf ');
  label = label.replace(/ sf /, ' sauf ');
  return label;
};

const main = async (): Promise<void> => {
  console.log('Starting...');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filepath);
  const sheet = workbook.getWorksheet(1);

  console.log('Worksheet ready');
  const output = {};
  const labelsMapping = {
    lvl5: {}, // Sections
    lvl4: {}, // Divisions
    lvl3: {}, // Groupes
    lvl2: {}, // Classes
    lvl1: {}, // Sous classes
  };

  let currentLvl1 = null;
  let currentLvl2 = null;
  let currentLvl3 = null;
  let currentLvl4 = null;
  let currentLvl5 = null;
  const cellValue = (cell: ExcelJS.Cell): string => {
    return cell.value !== null ? cell.value.toString().trim() : '';
  };
  sheet.eachRow((row: ExcelJS.Row) => {
    const rowCode = cellValue(row.getCell(2));
    let currentRowLvl = null;
    if (rowCode.indexOf('SECTION') > -1) {
      const sec = rowCode.replace(/SECTION/g, '').trim();
      currentLvl1 = sec;
      currentRowLvl = 1;
    } else if (rowCode.length === 2 && rowCode.indexOf('.') === -1) {
      const lvl2 = rowCode;
      currentLvl2 = lvl2;
      currentRowLvl = 2;
    } else if (rowCode.length === 4 && rowCode.indexOf('.') > -1) {
      const lvl3 = rowCode;
      currentLvl3 = lvl3;
      currentRowLvl = 3;
    } else if (rowCode.length === 5 && rowCode.indexOf('.') > -1) {
      const lvl4 = rowCode;
      currentLvl4 = lvl4;
      currentRowLvl = 4;
    } else if (rowCode.length > 5 && rowCode.indexOf('.') > -1) {
      const lvl5 = rowCode;
      currentLvl5 = lvl5;
      currentRowLvl = 5;
    } else {
      // useless row
    }

    let label, label65, label40;
    if (currentRowLvl !== null) {
      label = cellValue(row.getCell(3));
      label65 = cellValue(row.getCell(4));
      label40 = cellValue(row.getCell(5));
    }

    switch (currentRowLvl) {
      case 1: // Sections
        console.log('- ' + currentLvl1);
        labelsMapping.lvl1[currentLvl1] = beautifyLabel(label65);
        !output[currentLvl1] &&
          (output[currentLvl1] = {
            divisions: {},
            labels: {
              label: label,
              label_65: label65,
              label_40: label40,
            },
          });
        break;
      case 2: // Divisions
        console.log('-- ' + currentLvl2);
        labelsMapping.lvl2[currentLvl2] = beautifyLabel(label65);
        !output[currentLvl1].divisions[currentLvl2] &&
          (output[currentLvl1].divisions[currentLvl2] = {
            groups: {},
            labels: {
              label: label,
              label_65: label65,
              label_40: label40,
            },
          });
        break;
      case 3: // Groupes
        console.log('--- ' + currentLvl3);
        labelsMapping.lvl3[currentLvl3] = beautifyLabel(label65);
        !output[currentLvl1].divisions[currentLvl2].groups[currentLvl3] &&
          (output[currentLvl1].divisions[currentLvl2].groups[currentLvl3] = {
            classes: {},
            labels: {
              label: label,
              label_65: label65,
              label_40: label40,
            },
          });
        break;
      case 4: // Classes
        console.log('---- ' + currentLvl4);
        labelsMapping.lvl4[currentLvl4] = beautifyLabel(label65);
        !output[currentLvl1].divisions[currentLvl2].groups[currentLvl3].classes[
          currentLvl4
        ] &&
          (output[currentLvl1].divisions[currentLvl2].groups[
            currentLvl3
          ].classes[currentLvl4] = {
            subclasses: {},
            labels: {
              label: label,
              label_65: label65,
              label_40: label40,
            },
          });
        break;
      case 5: // Sous-classes
        console.log('----- ' + currentLvl5);
        labelsMapping.lvl5[currentLvl5] = beautifyLabel(label65);
        output[currentLvl1].divisions[currentLvl2].groups[currentLvl3].classes[
          currentLvl4
        ].subclasses[currentLvl5] = {
          labels: {
            label: label,
            label_65: label65,
            label_40: label40,
          },
        };
        break;
    }
  });

  console.log('Writing outputs...');

  const jsonOutput = JSON.stringify(output);
  await fs.writeFileSync(outputFilepath, jsonOutput);

  for (const lvl of Object.keys(labelsMapping)) {
    const json = JSON.stringify(labelsMapping[lvl]);
    await fs.writeFileSync(outputLabelsFilepath(lvl), json);
  }

  console.log('Done.');
};

main();
