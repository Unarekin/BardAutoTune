import { Injectable, EventEmitter } from '@angular/core';
// var PouchDB = require("pouchdb");
import PouchDB from 'pouchdb-browser';
import * as PouchFind from 'pouchdb-find';

import { QueryResult } from '../../../interfaces';


/**
 * Provides access to PouchDB based database storage.
 */
@Injectable()
export class DatabaseService {
  private databases: any = {};

  constructor() {
    PouchDB.plugin((PouchFind as any).default);

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
  private reduceDocs(res: any): QueryResult<any> {
    if (!res || !res.rows || !res.rows.length)
      return {Total: 0, Results: []};

    // console.log("DB response: ", res.rows[0].doc);
    return {
      Total: res.total_rows,
      Results: res.rows.map((doc: any) => doc.doc)
    };
  }

  /**
   * Retrieves all documents
   */
  public Fetch<T>(type: string, options: any = {}): Promise<QueryResult<T>> {
    return new Promise((resolve, reject) => {
      if (!this.databases[type]) {
        reject(new Error(`Unknown data type: '${type}.`));
      } else {
        let db = this.databases[type];

        let parsedOptions = Object.assign({}, options, {include_docs: true});
        db.allDocs(parsedOptions)
          .then(this.reduceDocs)
          .then(resolve)
          ;
      }
    })
  }

  /**
   * Queries for documents
   */
  public Query<T>(type: string, query: any): Promise<QueryResult<T>> {
    if (!this.databases[type])
      return Promise.reject(new Error(`Unknown data type: '${type}.`));

    // let parsedQuery = Object.assign({}, {selector: {}}, query);

    // console.log(type + " query: ", query);

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
            .then((res) => this.Get(type, res.id))
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