const db = require('../model/model');

const query_database = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const update_database = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

const append_database = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

module.exports = {
    query_database,
    update_database,
    append_database,
}