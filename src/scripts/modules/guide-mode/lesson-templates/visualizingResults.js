export default {
  'id': 4,
  'title': 'Visualizing Results',
  'steps': [
    {
      'id': 1,
      'position': 'center',
      'backdrop': true,
      'title': 'Introduction',
      'link': 'app',
      'isNavigationVisible': false,
      'markdown': 'Transformation results can be delivered to any analytics or business intelligence tool. <br/><br/> In this lesson, you are going to take the table you created in your transformation in Lesson 3 and generate a Tableau Data Extract (TDE) file. You will then load the file manually into Tableau Desktop for visualization using yet another Keboola Connection component – Writer. <br/><br/> _Note: Your own projects won’t be affected by this in any way._',
      'media': 'kbc_scheme_light_blue-wri.svg',
      'mediaType': 'img'
    },
    {
      'id': 2,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Create Writer',
      'link': 'writers',
      'media': '',
      'markdown': 'Let’s say you have Tableau Desktop installed on your computer. Now you need to find the writer Tableau in the **Writers** section.'
                + `
- Click on <span class="btn btn-success btn-xs">+ New Writer</span>.
- Find **Tableau**. You can use the search feature to find it faster.
- Click on <span class="btn btn-success btn-xs">More</span> and continue with <span class="btn btn-success btn-xs">+ New Configuration</span>.
- Name the configuration, e.g., *My writer* and click on <span class="btn btn-success btn-xs">Create Configuration</span>.
`,
      'mediaType': ''
    },
    {
      'id': 3,
      'position': 'aside',
      'backdrop': false,
      'isNavigationVisible': true,
      'title': 'Create Table',
      'markdown':
      'Now add the table you want to send to Tableau. For each of its columns you also need to specify whether it contains text or a number.'
      + `
- Click on <span class="btn btn-success btn-xs">+ New Table</span>.
- Select  \`out.c-snowflake.TRANSFORMED\` as the Source table you want to add to Tableau and click <span class="btn btn-success btn-xs">Select</span>..
- Specify a data type for each of the table's columns under **TDE Data Type** (COUNTRY/string, CARS/number, POPULATION/number, PERSON_PER_CAR/decimal). 
- <span class="btn btn-success btn-xs">Save</span> the configuration.
- Click <span class="btn btn-success btn-xs">Export tables to TDE</span> to run the writer. 
<br>

A Tableau Desktop Extract file will be created. In a real project, you would find the file in Storage under the tab **Files** from where it can be downloaded to your computer.   
`
    },
    {
      'id': 4,
      'position': 'center',
      'backdrop': true,
      'isNavigationVisible': false,
      'title': 'Run Extraction',
      'markdown': 'For the purposes of the Guide Mode, let’s say you have downloaded the Tableau Desktop Extract file to your computer and opened it in Tableau. The graph below is one of many reports you can create. <br/><br/> To see how to automate the whole process, continue to the next lesson – Project Automation. <br/><br/> Learn more about <a href="https://help.keboola.com/writers/" target="_blank">Writers</a>, or follow the hands-on tutorial on writing data in our <a href="https://help.keboola.com/tutorial/write/" target="_blank">user documentation</a>.',
      'media': 'tbl.png',
      'mediaType': 'img'
    }
  ]
};
