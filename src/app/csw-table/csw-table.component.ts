import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { isDevMode } from '@angular/core';

import {
  csvMatched,
  Dictionary,
  Filter,
  Iso19115Record,
  Iso19115RecordDiv,
} from 'src/lib/models';
import { getCSWRecords, getRecordsUrl, cswRecordsExists } from '../../lib/csw';
import { FileDialogComponent } from '../file-dialog/file-dialog.component';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HtmlSnackbarComponent } from '../html-snackbar/html-snackbar.component';
import { HttpErrorResponse } from '@angular/common/http';

export function nameOf<T>(name: Extract<keyof T, string>): string {
  return name;
}
const DEFAULT_CQL_QUERY = "type='dataset' AND keyword='basisset novex'";

@Component({
  selector: 'app-csw-table',
  templateUrl: './csw-table.component.html',
  styleUrls: ['./csw-table.component.css'],
})
export class CswTableComponent implements OnInit {
  title = 'novex-dataset-app';
  cswEndpoint = 'https://www.nationaalgeoregister.nl/geonetwork/srv/dut/csw'; // 'https://ngr.acceptatie.nationaalgeoregister.nl/geonetwork/srv/dut/csw'
  displayedColumns: string[] = [
    'mdId',
    'title',
    'resourceOwner',
    'keywords',
    'protocols',
  ];
  dataSource: Iso19115RecordDiv[] = [];
  dataView: Iso19115RecordDiv[] = [];
  csvData: Dictionary<string>[] = [];
  cswLoading: boolean = true;
  mdIdColumnCsv: string = '';
  // cqlQuery: string = '';

  filters: Filter[] = [];
  subscription: any;

  constructor(public dialog: MatDialog, private _snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  filterActive(filterColumn: string) {
    let filter = this.filters.find((x) => x.filterColumn === filterColumn);
    if (filter && filter.filterValues.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  openFilterDialog(filterColumn: string, filters: Filter[]): void {
    let filter = filters.find((x) => x.filterColumn === filterColumn);

    const dialogRef = this.dialog.open(FilterDialogComponent, {
      data: {
        column: filterColumn,
        dataSource: this.dataSource,
        filter: filter,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      let filterValues: string[] = result as string[];
      let filter: Filter = {
        filterColumn: filterColumn,
        filterValues: filterValues,
      };
      this.filters = this.filters.filter(
        (x) => x.filterColumn !== filter.filterColumn
      );
      if (filter.filterValues.length > 0) {
        this.filters.push(filter);
      }
      this.dataView = this.dataSource.filter((x) => {
        for (let myFilter of this.filters) {
          const myproperty = myFilter.filterColumn as keyof Iso19115RecordDiv;
          const myValue = x[myproperty];
          if (Array.isArray(myValue)) {
            const intersection = myFilter.filterValues.filter((element) =>
              (x[myproperty] as string[]).includes(element)
            );
            return intersection.length > 0;
          } else {
            return myFilter.filterValues.includes(x[myproperty] as string);
          }
        }
        if (this.filters.length === 0) {
          return true;
        } else {
          return false;
        }
      });
    });
  }
  downloadResultSet(): void {
    let data = this.dataView;
    const replacer = (
      value: string | boolean | null | undefined | csvMatched | string[]
    ) => {
      if (value === null || value === undefined) {
        return '""';
      }
      if (Array.isArray(value)) {
        let arrVAl: Object[] = value;
        return `"${arrVAl.join(',')}"`;
      }
      if (typeof value === 'string') {
        return `"${value.replace('"', '""')}"`;
      }
      return JSON.stringify(value);
    }; // specify how you want to handle null values here
    let blackList = ['abstract', 'resourceOwnerUrl', 'onlineResources'];

    const header = Object.getOwnPropertyNames(data[0]).filter(
      (x) => !blackList.includes(x)
    );
    let csv = data.map((record) =>
      header
        .map((fieldName) => {
          const myproperty = fieldName as keyof Iso19115RecordDiv;
          return replacer(record[myproperty]);
        })
        .filter((x) => x !== null)
        .join(',')
    );
    csv.unshift(header.map((x) => `"${x}"`).join(','));
    let csvArray = csv.join('\r\n');
    var blob = new Blob([csvArray], { type: 'text/csv' });
    saveAs(blob, 'myFile.csv');
    // download JSON
    // TODO: add dialog to choose download formats
    // var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    // saveAs(blob, 'myFile.json');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FileDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.csvData = result.csvData;
      this.mdIdColumnCsv = result.mdIdColumn;

      this.csvData.map((x) => {
        let cswRecord = this.dataSource.find(
          (y) => y.mdId === x[this.mdIdColumnCsv]
        );
        if (cswRecord) {
          cswRecord.csvMatched = csvMatched.True;
          x['csvMatched'] = 'true';
        }
      });
      this.csvData
        .filter((x) => !Object.keys(x).includes('csvMatched'))
        .map((x) => (x['csvMatched'] = 'false'));

      let csvRecordsNotMatched = this.csvData.filter(
        (x) => x['csvMatched'] === 'false'
      );
      this.dataSource
        .filter((x) => x.csvMatched !== csvMatched.True)
        .map((x) => (x.csvMatched = csvMatched.False));

      let ids: string[] = csvRecordsNotMatched.map(
        (x) => x['metadata-identifier']
      );
      cswRecordsExists(this.cswEndpoint, ids)
        .then((result) => {
          csvRecordsNotMatched.map((x) => {
            let record = new Iso19115RecordDiv();
            record.mdId = x[this.mdIdColumnCsv];
            if (result[record.mdId]) {
              record.csvMatched = csvMatched.RecordInCatalogNoKeyword;
            } else {
              record.csvMatched = csvMatched.RecordNotInCatalog;
            }
            this.dataSource.push(record);
          });
          this.displayedColumns.push('csvMatched');
        })
        .catch((error) => {
          alert(
            `something went wrong retrieving the unmatched records from the CSW service: ${this.cswEndpoint}, see the console.log for the specific error message.`
          );
          console.error(error);
          this.dataSource = []; // TODO: improve above code so that if the call to cswRecordsExists nothing happened, now we reset the view to not show partial results
          this.dataView = [];
        });
    });
  }
  public get csvMatched() {
    return csvMatched;
  }

  getTooltipCsvMatched(csvMatchedVal: csvMatched) {
    switch (csvMatchedVal) {
      case csvMatched.True:
        return 'Record in NGR en in CSV bestand';
      case csvMatched.False:
        return 'Record in NGR maar niet in CSV bestand';
      case csvMatched.RecordNotInCatalog:
        return 'Record in CSV bestand maar niet in NGR';
      default:
        return '';
    }
  }

  getMatchedClass(element: Iso19115RecordDiv) {
    if (this.csvData.length > 0) {
      switch (element.csvMatched) {
        case csvMatched.True:
          return 'inCsv';
        case csvMatched.False:
          return 'notInCsv';
        case csvMatched.RecordNotInCatalog:
          return 'notInNGR';
        case csvMatched.RecordInCatalogNoKeyword:
          return 'inNGRNoKeyword';
        default:
          return '';
      }
    } else {
      return '';
    }
  }

  sortRecords(a: Iso19115RecordDiv, b: Iso19115RecordDiv): number {
    if (a.title === undefined && b.title === undefined) {
      return 0;
    }
    if (a.title === undefined && b.title !== undefined) {
      return -1;
    }
    if (a.title !== undefined && b.title === undefined) {
      return 1;
    }

    if (a.title!.toLowerCase() < b.title!.toLowerCase()) {
      return -1;
    }
    if (a.title!.toLowerCase() > b.title!.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  getRecords() {
    let promise: Promise<Iso19115Record[] | HttpErrorResponse>;
    this.cswLoading = true;

    if (isDevMode()) {
      // for easily switching to local data in assets/mock.xml add following args: ,-1,"assets/mock.xml"
      promise = getCSWRecords(this.cswEndpoint, this.cqlQuery);
    } else {
      promise = getCSWRecords(this.cswEndpoint, this.cqlQuery);
    }

    promise
      .then((records: Iso19115Record[] | HttpErrorResponse) => {
        let recordPromise: Iso19115Record[] = records as Iso19115Record[];
        this.dataSource = recordPromise
          .map((x) => x as Iso19115RecordDiv)
          .sort(this.sortRecords);
        this.dataView = this.dataSource;
        this.cswLoading = false;
        let url = getRecordsUrl(this.cswEndpoint, this.cqlQuery);
        this._snackBar.openFromComponent(HtmlSnackbarComponent, {
          data: {
            html: `<p>${
              this.dataSource.length
            } Metadata records opgehaald uit het NGR met de <a title="Bekijk deze CSW query in het NGR" target="_blank" href="${url}">query</a>: </p><pre><code>${decodeURIComponent(
              this.cqlQuery
            )}</code></pre>`,
          },
        });
      })
      .catch((e) => {
        this.cswLoading = false;
        this.dataSource = [];
        this.dataView = this.dataSource;
        this._snackBar.openFromComponent(HtmlSnackbarComponent, {
          data: {
            html: `<p>Ophalen van records uit NGR mislukt voor deze <a title="Bekijk deze CSW query in het NGR" target="_blank" href="${e.url}">query</a>. HTTP status code: ${e.status}</p>`,
            error: true,
          },
        });
      });
  }

  public get cqlQuery(): string {
    let hash: string = location.hash;
    hash = hash.replace('#', '');
    return encodeURIComponent(hash).replaceAll('%25', '%'); // prevent encoding percentages %25 again
  }
  public set cqlQuery(queryString: string) {
    location.hash = encodeURIComponent(queryString);
  }

  ngOnInit() {
    if (this.cqlQuery === '') {
      this.cqlQuery = DEFAULT_CQL_QUERY;
    }
    this.getRecords();
    window.addEventListener('hashchange', (e) => {
      this.getRecords();
    });
  }
}
