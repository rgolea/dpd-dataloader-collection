# dpd-dataloader-collection
A deployd collection that uses dataloader to batch and cache queries

# Usage

A collection that uses Facebook's [Dataloader](https://github.com/facebook/dataloader) in order to batch and cache requests. It works like a regular collection. In order to migrate from a common collection to a dataloader collection you just need to go to the collection's config file and change:
```
{
  "type": "Collection",
  ...
}
```
to
```
{
  "type": "DataloaderCollection",
  ...
}
```
Issues and Pull Requests are welcome.

Thank you!
