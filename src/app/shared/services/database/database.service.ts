import { Injectable, EventEmitter } from '@angular/core';
// var PouchDB = require("pouchdb");
import PouchDB from 'pouchdb-browser';

@Injectable()
export class DatabaseService {

  private isInstantiated: boolean;
  private database: any;
  private listener: EventEmitter<any> = new EventEmitter();

  public constructor() {
    if(!this.isInstantiated) {
      this.database = new PouchDB("nraboy");
      this.isInstantiated = true;
    }

    this.fetch = this.fetch.bind(this);
    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
    this.getChangeListener = this.getChangeListener.bind(this);
  }

  public fetch() {
    return this.database.allDocs({include_docs: true});
  }

  public get(id: string) {
    return this.database.get(id);
  }

  public put(id: string, document: any) {
    document._id = id;
    return this.get(id).then(result => {
      document._rev = result._rev;
      return this.database.put(document);
    }, error => {
      if(error.status == "404") {
        return this.database.put(document);
      } else {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      }
    });
  }

  public getChangeListener() {
      return this.listener;
  }

}