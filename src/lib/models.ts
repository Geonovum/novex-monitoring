export interface Dictionary<T> {
  [Key: string]: T;
}
export interface Filter {
  filterColumn: string;
  filterValues: string[];
}
export class Iso19115Record {
  constructor(
    public title?: string,
    public mdId?: string,
    public abstract?: string,
    public keywords?: string[],
    public resourceOwner?: string,
    public resourceOwnerUrl?: string,
    public protocols?: string[],
    public onlineResources?: string[]
  ) {}
}

export enum csvMatched {
  True = 'true',
  False = 'false',
  RecordNotInCatalog = 'recordNotInCatalog',
}
export class Iso19115RecordDiv extends Iso19115Record {
  constructor(
    public override title?: string,
    public override mdId?: string,
    public override abstract?: string,
    public override keywords?: string[],
    public override resourceOwner?: string,
    public override resourceOwnerUrl?: string,
    public override protocols?: string[],
    public override onlineResources?: string[],
    public csvMatched?: csvMatched
  ) {
    super(
      title,
      mdId,
      abstract,
      keywords,
      resourceOwner,
      resourceOwnerUrl,
      protocols,
      onlineResources
    );
  }
}

export class ServiceRecord extends Iso19115Record {
  constructor(
    public override title: string,
    public override mdId: string,
    public override abstract: string,
    public override keywords: string[],
    public override resourceOwner: string,
    public override resourceOwnerUrl: string,
    public url: string,
    public protocol: string,
    public datasetSourceMdId: string,
    public serviceType: string[],
    public serviceProvider: string
  ) {
    super(title, mdId, abstract, keywords, resourceOwner, resourceOwnerUrl);
  }
}
