const Collection = require('deployd/lib/resources/collection');
const Dataloader = require('dataloader');
const Bluebird = require('bluebird');
const _ = require('underscore');

module.exports = class DataloaderCollection extends Collection {
  constructor(name, options){
    super(name, options);

    if(this.store){
      let find = this.store.find.bind(this.store);
      //Creating dataloader
      this.store.loader = new Dataloader(keys => {
        return new Bluebird((resolve, reject) => {
          find({
            id: {
              $in: keys
            }
          }, (err, data) => {
            if(err) {
              return reject(err);
            } else {
              let indexed = _.indexBy(data, 'id');
              return resolve(_.map(keys, key => indexed[key] || null));
            }
          });
        });
      });


      //changing usage of find

      this.store.find = function(query, fn){
        if(_.keys(query).length === 1 && query.id){
          if(query.id.$in){
            this.loader.loadMany(query.id.$in).then((data) => {
              fn(null, data);
            }).catch(fn);
          } else {
            this.loader.load(query.id).then(data => {
              fn(null, data);
            }).catch(fn);
          }
        } else {
          return find(query, fn);
        }
      };

      //changing usage of remove

      let remove = this.store.remove;

      this.store.remove = function(query){
        if(_.keys(query).length === 1 && query.id){
          if(query.id.$in){
            _.each(query.id.$in, id => this.loader.clear(id));
          } else {
            this.loader.clear(query.id);
          }
        } else {
          this.loader.clearAll();
        }
        return remove.apply(this, arguments);
      };

      //changing usage of insert

      let insert = this.store.insert.bind(this.store);

      this.store.insert = function(object, fn){
        return insert(object, (err, result) => {
          if(err){
            this.loader.clearAll();
          } else {
            if(_.isArray(object)){
              _.each(object, o => this.loader.prime(o.id, o));
            } else {
              this.loader.prime(object.id, object);
            }
          }
          fn(err, result);
        });
      };

      //clearing cache if other methods are being used

      let getCollection = this.store.getCollection;

      this.store.getCollection = function(){
        this.loader.clearAll();
        return getCollection.apply(this, arguments);
      };

      let rename = this.store.rename;

      this.store.rename = function(){
        this.loader.clearAll();
        return rename.apply(this, arguments);
      };
    }
  }
};
