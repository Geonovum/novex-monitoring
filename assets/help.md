&nbsp;
&nbsp;

Deze applicatie maakt het mogelijk om een set metadata records uit de [Catalogue Service for the Web (CSW)](https://nationaalgeoregister.nl/geonetwork/srv/dut/csw?service=CSW&request=GetCapabilities) service van het [Nationaal Georegister (NGR)](https://www.nationaalgeoregister.nl/geonetwork/) te vergelijken met een set metadata records uit een CSV-bestand. De beoogde usecase is om te verifiëren of alle metadata records uit het CSV-bestand ook in het NGR voorkomen. 

De applicatie workflow is als volgt:


## Stap 1: ophalen metadata records

Laadt de [applicatie](./), standaard worden alle dataset metadata records opgehaald met het keyword [`basisset novex`](https://www.nationaalgeoregister.nl/geonetwork/srv/dut/csw?request=GetRecords&Service=CSW&Version=2.0.2&typeNames=gmd:MD_Metadata&constraint=type%3D%27dataset%27%20AND%20keyword%3D%27basisset%20novex%27&constraintLanguage=CQL_TEXT&constraint_language_version=1.1.0&outputSchema=http://www.isotc211.org/2005/gmd&elementSetName=full&resultType=results).


> N.B. De standaard CSW-query (`type='dataset' AND keyword='basisset novex'`) kan worden aangepast door deze in URL aan te passen of door op een `keyword` of een `resourceOwner` link te klikken in de tabel.

Na het succesvol ophalen van de metadata records uit het NGR, wordt onderin beeld een notificatie getoond met het aantal records dat is opgehaald plus een hyperlink naar het CSW request (met query). 

![Notificatie records opgehaald](./assets/notificatie.png "Notificatie records opgehaald")


## Stap 2: uploaden CSV-bestand

> *N.B. het CSV (comma-separated values) bestand dient een header te bevatten en 1 kolom met [metadata identifiers](https://docs.geostandaarden.nl/md/mdprofiel-iso19115/#x5-2-42-metadata-unieke-identifier).*

1. Klik op de upload button om een CSV-bestand te uploaden
   
   ![Upload CSV Knop](./assets/upload-button.png "Upload CSV Knop")

2. Selecteer de kolom met de metadata identifiers in het CSV-bestand 

    ![Selecteer Kolom](./assets/select-column.png "Selecteer Kolom")

Na het succesvol uploaden en toepassen van het CSV-bestand wordt een kolom toegevoegd aan de tabel met de naam: `csvMatched`. Deze kan de volgende waardes hebben (inclusief de kleurcodering die wordt toegepast in de tabel):


&nbsp;
|kleur                                                                                                                              |waarde              |beschrijving                            |
|-----------------------------------------------------------------------------------------------------------------------------------|--------------------|----------------------------------------|
|<div style="display:inline-block;background-color: #e6ffec;width:14px;height:14px;border-radius:2px;border:1px gray solid;"></div> |`true`              | Metadata record zowel in NGR als in CSV|
|<div style="display:inline-block;background-color:#ffebe9;width:14px;height:14px;border-radius:2px;border:1px gray solid;"></div>  | `false`            | Metadata record in NGR, maar niet in CSV|
|<div style="display:inline-block;background-color:#fffce9;width:14px;height:14px;border-radius:2px;border:1px gray solid;"></div>  |`recordNotInCatalog`| Metadata record niet in NGR, maar wel in CSV|
&nbsp;


## Stap 3: downloaden CSV-bestand

Klik op de download knop om de lijst van metadata records met de `csvMatched` kolom te downloaden als CSV-bestand. 

![Download CSV Knop](./assets/download-button.png "Download CSV Knop")

> N.B. *Op de kolommen `resourceOwner` en `csvMatched` kan gefilterd worden. Bij het downloaden van de lijst van metadata records worden deze filters ook toegepast.*
