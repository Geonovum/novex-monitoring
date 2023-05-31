import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  NgrCsvMatch,
  Dictionary,
  Filter,
  Iso19115RecordDiv,
} from 'src/lib/models';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.css'],
})
export class FilterDialogComponent implements OnInit {
  dataSource: Iso19115RecordDiv[] = [];
  column: string = '';
  filterValues: (string | string[] | NgrCsvMatch | undefined)[] = [];
  selectedValues: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Dictionary<Object>
  ) {
    this.column = data['column'] as string;
    this.dataSource = data['dataSource'] as Iso19115RecordDiv[];
    let filter = data['filter'] as Filter;
    if (filter !== undefined) {
      this.selectedValues = filter.filterValues;
    }
    const myproperty = this.column as keyof Iso19115RecordDiv;
    // let myType = typeof this.dataSource[0][myproperty];

    let values = this.dataSource.map((x) => x[myproperty]);
    values = values.flat();
    this.filterValues = values.filter((x, i, a) => a.indexOf(x) === i).sort();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {}
}
