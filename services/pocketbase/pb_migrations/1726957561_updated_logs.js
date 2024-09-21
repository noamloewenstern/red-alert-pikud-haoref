/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qf5zc23o682xuak")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "41l1gpjr",
    "name": "level",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "debug",
        "info",
        "log",
        "warn",
        "warning",
        "error"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qf5zc23o682xuak")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "41l1gpjr",
    "name": "level",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "debug",
        "info",
        "log",
        "warning",
        "error"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
