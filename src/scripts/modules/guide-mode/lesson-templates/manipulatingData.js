import JobsConstants from '../../jobs/Constants';
import TransformationsConstants from '../../transformations/Constants';

const {JOB_LOAD_SUCCESS} = JobsConstants.ActionTypes;
const {TRANSFORMATION_BUCKET_CREATE_SUCCESS, TRANSFORMATION_CREATE_SUCCESS} = TransformationsConstants.ActionTypes;

export default {
  'id': 3,
  'title': 'Manipulating Data',
  'steps': [
    {
      'id': 1,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Introduction',
      'link': '/',
      'markdown': 'In this lesson, you will process the data loaded into Storage in Lesson 2. <br/><br/> Using a simple transformation, you will join the tables (Cars and Population) and compute the ratio of motor vehicles to persons per country. The result will be also kept in Storage. <br/><br/> _Note: Your own projects won’t be affected by this in any way._',
      'media': 'kbc_scheme_light_blue-tra.svg',
      'mediaType': 'img'
    }, {
      'id': 2,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Create Bucket',
      'link': 'transformations',
      'markdown': 'Like tables in Storage, Transformations are organized into buckets. Before creating your transformation, you need to create a new bucket. <br/><br/> Click on **+ New Transformation Bucket** and name it, e.g., *My transformation bucket*.',
      'nextStepDispatchAction': {type: TRANSFORMATION_BUCKET_CREATE_SUCCESS},
      'media': '',
      'mediaType': ''
    }, {
      'id': 3,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Create Transformation',
      'link': '/',
      'markdown': 'Now add a new transformation into the new bucket by clicking on **+ New Transformation**. Name the transformation *My transformation* and select Snowflake as the backend &ndash; the engine running the transformation script.',
      'nextStepDispatchAction': {type: TRANSFORMATION_CREATE_SUCCESS},
      'media': '',
      'mediaType': ''
    }, {
      'id': 4,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Map Data & Set Queries',
      'link': '/',
      'markdown':
      'Now let’s specify the following: '

      + `
- **Input Mapping** &ndash; what tables will be used in the transformation
- **Output Mapping** &ndash; what tables will be written to Storage as results
- **Queries** &ndash; what will happen with the data in the transformation
<br>
<br>
- Click on **+ New Input** and select \`in.c-tutorial.cars\` as the Source table from the drop down menu. Accept the suggested Destination. It is the name of the selected table inside the transformation. Press **Create Input**.
- Repeat the steps for the second table. Click on **+ New Input** and select \`in.c-tutorial.population\` as the Source table.
- Then click on **+ New Output** and enter *Transformed* as the Source table. This table does not exist yet. It will be created in the transformation. 
- Set Destination to \`out.c-snowflake.transformed\`. This is the name the new table *Transformed* will have when put in Storage. Press **Create output**.
- To create your output table, paste the following code to **Queries** \`CREATE TABLE "transformed" AS SELECT "cars".*, "population"."POPULATION", ("population"."POPULATION" / "cars"."CARS") AS "PERSON_PER_CAR" FROM "cars" JOIN "population" On "cars"."COUNTRY" = "population"."COUNTRY"\` and **Save** it.
- Click on **Next Step**.

`,
      'media': '',
      'mediaType': ''
    }, {
      'id': 5,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Run Transformation',
      'link': '/',
      'markdown': 'Now when everything is ready, you can click on **Run transformation**. <br/><br/> The specified tables will be taken from Storage and put in a transformation database where they will be changed by the queries. The result will be put in to Storage back again.',
      'nextStepDispatchAction': {type: JOB_LOAD_SUCCESS},
      'media': '',
      'mediaType': ''
    }, {
      'id': 6,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Check Jobs',
      'link': 'jobs',
      'markdown': 'You can see the status of your jobs in the section **Jobs**. Your input tables were joined and the output table *Transformed* was created. You can check the details of each job here too.' +
      '<br/><br/> When you are ready, hit **Next step**.',
      'media': '',
      'mediaType': ''
    }, {
      'id': 7,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Check Storage',
      'link': 'storage',
      'markdown': 'You can see what the final table looks like in this Data Sample in Storage. <br/><br/> To see how to write the output data from Keboola Connection, continue to the next lesson - Visualizing Results. <br/><br/> Learn more about <a href="https://help.keboola.com/manipulation/" target="_blank">Data Manipulation</a>, or follow a hands-on tutorial on data transformation in our <a href="https://help.keboola.com/tutorial/load" target="_blank">user documentation</a>.',
      'media': '',
      'mediaType': ''
    },
    {
      'id': 8,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Congratulations',
      'link': '/',
      'markdown': 'Congratulations! Lesson finished.',
      'media': 'keboola-finished.svg',
      'mediaType': 'img'
    }
  ]
};
