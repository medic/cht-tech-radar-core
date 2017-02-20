import fs, { readFile, outputFile } from 'fs-extra';
import path from 'path';
import frontmatter from 'front-matter';
import marked from 'marked';
import {
  radarPath,
  distPath,
  getAllMarkdownFiles,
} from './file';

export const createRadar = async (tree) => {
  const fileNames = (await getAllMarkdownFiles(radarPath()));
  const revisions = await createRevisionsFromFiles(fileNames);
  const allReleases = getAllReleases(revisions);
  const items = createItems(revisions);
  const flaggedItems = flagWithIsNew(items, allReleases);

  return {
    items: flaggedItems,
    releases: allReleases,
  };
};

const checkAttributes = (fileName, attributes) => {
  const rings = ['trial', 'assess', 'adopt', 'hold'];
  if (attributes.ring && !rings.includes(attributes.ring)) {
    throw new Error(`Error: ${fileName} has an illegal value for 'ring' - must be one of ${rings}`);
  }

  const quadrants = ['languages-and-frameworks', 'methods-and-patterns', 'platforms-and-aoe-services', 'tools'];
  if (attributes.quadrant && !quadrants.includes(attributes.quadrant)) {
    throw new Error(`Error: ${fileName} has an illegal value for 'quadrant' - must be one of ${quadrants}`);
  }
}

const createRevisionsFromFiles = (fileNames) => (
  Promise.all(fileNames.map((fileName) => {
    return new Promise((resolve, reject) => {
      readFile(fileName, 'utf8', (err, data) => {
        if(err) {
          reject(err);
        } else {
          const fm = frontmatter(data);
          checkAttributes(fileName, fm.attributes);
          resolve({
            ...itemInfoFromFilename(fileName),
            ...fm.attributes,
            fileName,
            body: marked(fm.body),
          });
        }
      });
    })
  }))
)

const itemInfoFromFilename = (fileName) => {
  const [
    release,
    nameWithSuffix,
  ] = fileName.split('/').slice(-2);
  return {
    name: nameWithSuffix.substr(0, nameWithSuffix.length - 3),
    release,
  }
};

const getAllReleases = (revisions) => (
  revisions.reduce((allReleases, { release }) => {
    if(!allReleases.includes(release)) {
      return [...allReleases, release];
    }
    return allReleases;
  }, []).sort()
)

// const createQuadrants = (revisions) => (
//   revisions.reduce((quadrants, revision) => {
//     return {
//       ...quadrants,
//       [revision.quadrant]: addRevisionToQuadrant(quadrants[revision.quadrant], revision),
//     };
//   }, {})
// );

// const addRevisionToQuadrant = (quadrant = {}, revision) => ({
//   ...quadrant,
//   [revision.name]: addRevisionToItem(quadrant[revision.name], revision),
// });

const addRevisionToQuadrant = (quadrant = {}, revision) => ({
  ...quadrant,
  [revision.ring]: addRevisionToRing(quadrant[revision.ring], revision),
});

const createItems = (revisions) => {
  const itemMap = revisions.reduce((items, revision) => {
    return {
      ...items,
      [revision.name]: addRevisionToItem(items[revision.name], revision),
    };
  }, {});

  return Object
    .values(itemMap)
    .sort((x, y) => (x.name > y.name ? 1 : -1));
}

const addRevisionToItem = (item = {
  attributes: {
    isFeatured: true,
  },
  revisions: [],
}, revision) => {
  const {
    fileName,
    ...rest,
  } = revision;
  let newItem = {
    ...item,
    ...rest,
    attributes: {
      ...item.attributes,
      ...revision.attributes,
    },
  };

  if (revisionCreatesNewHistoryEntry(revision)) {
    newItem = {
      ...newItem,
      revisions: [
        rest,
        ...newItem.revisions,
      ],
    }
  }

  return newItem;
};

const revisionCreatesNewHistoryEntry = (revision) => {
  return revision.body.trim() !== '' ||
         typeof revision.ring !== 'undefined';
};

const flagWithIsNew = (items, allReleases) => (
  items.map((item) => ({
    ...item,
    isNew: isNewItem(item, allReleases),
  }), [])
);

const isNewItem = (item, allReleases) => {
  return item.revisions.length > 1 && item.revisions[0].release === allReleases[allReleases.length-1]
}