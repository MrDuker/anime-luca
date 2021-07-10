"use strict";

const { MongoClient } = require('mongodb');

module.exports = class DB {
    constructor(uri) {
        const core = new MongoClient(uri, { useUnifiedTopology: true });
        let main = null;
        let connected = false;

        /**
         * @async
         * Starts the database connection.
         * @returns {Promise<undefined>}
         */
        this.connect = () => {
            if (connected) return;

            return new Promise(resolve => {
                core.connect(err => {
                    if (err) throw err;
                    connected = true;
                    resolve(null);
                });
            });
        };

        /**
         * @async
         * Closes the database.
         * @returns {Promise<undefined>}
         */
        this.close = async () => {
            if (!connected) return;
            connected = false;
            main = null;
            return await core.close();
        };

        /**
         * Selectts the db and/or collection.
         * @param {string} _db The database name.
         * @param {string} _collection The collection name.
         * @returns {undefined}
         */
        this.selectCollection = (_db, _collection) => {
            main = core.db(_db).collection(_collection);
        };

        /**
         * @async
         * Returns a document from the database.
         * @param {any} [where] The filter.
         * @returns {Promise<any[] | any | null>} The result, or null if not exist.
         */
        this.get = (where) => {
            if (!main) return;
            return new Promise(resolve => main.find(where || {}).toArray((err, docs) => resolve(err ? null : (docs.length === 1 ? docs[0] : (docs.length ? docs : null)))));
        };

        /**
         * @async
         * Updates the databse with stuff.
         * @param {any} where The filter.
         * @param {any} newData The new data.
         * @returns {Promise<boolean>} The result if updated or not.
         */
        this.set = (where, newData) => {
            if (!main) return;
            return new Promise(resolve => main.updateOne(where, newData, err => resolve(err ? false : true)));
        };

        /**
         * @async
         * Adds a document to the database.
         * @param {any|any[]} data The document to add.
         * @returns {Promise<boolean>} Boolean if added or not.
         */
        this.add = (data) => {
            if (!main) return;
            else if (!Array.isArray(data)) data = [data];

            return new Promise(resolve => main.insertMany(data, err => resolve(err ? false : true)));
        };

        /**
         * @async
         * Deletes something from the database.
         * @param {any} data The query.
         * @returns {Promise<boolean>} Boolean if deleted or not.
         */
        this.delete = (data) => {
            if (!main) return;
            return new Promise(resolve => main.deleteOne(data, err => resolve(err ? false : true)));
        };
    }
};