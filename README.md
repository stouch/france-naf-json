
# Generate the JSON files

```
npm run build
npm start
```

The generated JSON files are : 
- output.json            : NAF rev2 2008 nested levels
- output-labels-1.json   : Sections
- output-labels-2.json   : Divisions
- output-labels-3.json   : Groupes
- output-labels-4.json   : Classes
- output-labels-5.json   : Sous-classes

But we also generate some archive JSON files :
- output-labels-1973-1992.json  : Old NAP600 codes (1973-1992)
- output-labels-1993-2003.json  : Old NAF700 codes (1993-2003)
- output-naf1-naf2.json  : Mapping between Naf rev1 (version 2003) to Naf rev2 (2008)

# Source

- https://www.insee.fr/fr/information/2120875
- https://www.insee.fr/fr/information/2579599

# Dev

```
npm run dev
```