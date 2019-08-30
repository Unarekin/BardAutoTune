import { Injectable, EventEmitter } from '@angular/core';
// var PouchDB = require("pouchdb");
import PouchDB from 'pouchdb-browser';

/**
 * Provides access to PouchDB based database storage.
 */
@Injectable()
export class DatabaseService {
  private databases: any = {};

  constructor() {
    this.databases['song'] = new PouchDB('songs');
    this.databases['setting'] = new PouchDB('settings');
    this.databases['playlist'] = new PouchDB('playlists');

    // Bindings
    this.Fetch = this.Fetch.bind(this);
    this.Get = this.Get.bind(this);
    this.Put = this.Put.bind(this);
    this.Query = this.Query.bind(this);

    this.reduceDocs = this.reduceDocs.bind(this);
  }

  /**
   * Takes a PouchDB response object and reduces it down to just a list
   * of returned documents, for easy consumption.
   */
  private reduceDocs(res: any): any[] {
    return res.rows.reduce((doc: any) => doc.doc);
  }

  /**
   * Retrieves all documents
   */
  public Fetch(type: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.databases[type]) {
        reject(new Error(`Unknown data type: '${type}.`));
      } else {
        let db = this.databases[type];

        db.allDocs({include_docs: true})
          .then(this.reduceDocs);
      }
    })
  }

  /**
   * Queries for documents
   */
  public Query(type: string, query: any): Promise<any[]> {
    if (!this.databases[type])
      return Promise.reject(new Error(`Unknown data type: '${type}.`));

    return this.databases[type].find(query)
              .then(this.reduceDocs);
  }

  /**
   * Retrieves a specified document.
   */
  public Get(type: string, id: string): Promise<any> {
    if (!this.databases[type])
      return Promise.reject(new Error(`Unknown data type: '${type}'.`));

    return this.databases[type].get(id).then(this.reduceDocs);    
  }


  /**
   * Creates a new document.
   */
  public Put(type: string, document: any): Promise<any> {
    if (!this.databases[type])
      return Promise.reject(new Error(`Unknown data type: '${type}'.`));

    return this.databases[type]
            .put(document)
            .then((res) => {
              return this.databases[type].get(type, res.id);
            })
            ;
  }

  /**
   * Deletes a document from a database.
   */
  public Delete(type: string, _id: string): Promise<void> {
    if (!this.databases[type])
      return Promise.reject(new Error(`Unknown data type: '${type}'.`));

    return this.databases[type].remove(_id);
  }

}