# Create content in the browser

Now that you have access to your course in [https://us.prairielearn.com](https://us.prairielearn.com), it is time to start creating course content.

This is a view of your course home page (or a similar variation, depending on when your course was originally created):

![Screenshot of the menu bar for the course home page](start-guide/homepage.png)

This tutorial will show you how to create:

- [a course instance](#creating-a-course-instance)
- [simple questions from scratch](#creating-questions-from-scratch)
- [questions using templates from inside your course](#start-a-new-question-from-an-existing-one-inside-your-own-course)
- [questions using templates from outside courses](#start-a-new-question-from-an-existing-one-outside-your-own-course)
- [assessments](#creating-a-new-assessment)

## Creating a course instance

A course instance corresponds to a single offering of a course, such as "Fall 2024", or possibly "Fall 2024, Section M". Follow the steps below to create a new course instance:

- click the button `Add course instance`.

- click the button `Change CIID` to change the course instance ID name. We typically recommend using a short version of the course instance name, for example, `Fa24`.

- click the `Edit` button next to `infoCourseInstance.json`.

- in `longName`, add your course instance name. For example:

  ```json title="infoCourseInstance.json"
  {
    "longName": "Fall 2024, Section M"
  }
  ```

- in `allowAccess`, you should set the dates in which you want your course to be available (other [access options](courseInstance.md#access-controls)). For example:

  ```json title="infoCourseInstance.json"
  {
    "allowAccess": [
      {
        "startDate": "2024-08-17T00:00:01",
        "endDate": "2024-12-18T23:59:59"
      }
    ]
  }
  ```

- click `Save and sync`.

- You will be able to see the new course instance from the course home page. You can always return to the course home page by clicking your course number from the top menu, next to the PrairieLearn button.

## Creating questions from scratch

### Add a new question

- go to the `Questions` tab. Your questions page should be similar to the example below:

![Screenshot of the question tab](start-guide/question_tab.png)

- click the button `Add question`.

- click the button `Change QID` to change the question ID name. Typically, question authors choose QID that provide some big-picture idea of the question topic. For example, `find_rectangle_area`.

- click the `Edit question configuration` link to modify the `info.json` file.

- change the question `title`. For example:

  ```json title="info.json"
  {
    "title": "Find the area"
  }
  ```

- change the question `topic`. This will be very helpful when using the filter to find questions under a specific topic. For example:

  ```json title="info.json"
  {
    "topic": "Geometric properties"
  }
  ```

- you can use [tags](course/index.md/#tags) to add more levels to your filter. For example, you can add the email of the question author, the semester when the question was created, and the type of question. Tags are optional.

  ```json title="info.json"
  {
    "tags": ["author@email.com", "fa24", "MC"]
  }
  ```

- you should not change the `"type": "v3"` field, which is the most current version of PrairieLearn questions.

- click `Save and sync`.

### Change the content of the question

To provide a simple example, here we first create a question without any randomization, by modifying the file [question.html](question/index.md#html-questionhtml).

- go to the `Files` tab.

- click the `Edit` button next to `question.html`.

- Modify the content of the file. You may want to start by copying this simple example:

  ```html title="question.html"
  <pl-question-panel>
    <p>What is the area of a rectangle that has sides 4 and 5?</p>
  </pl-question-panel>

  <pl-multiple-choice answers-name="area">
    <pl-answer correct="true">20</pl-answer>
    <pl-answer correct="false">10</pl-answer>
    <pl-answer correct="false">9</pl-answer>
    <pl-answer correct="false">18</pl-answer>
    <pl-answer correct="false">40</pl-answer>
  </pl-multiple-choice>
  ```

- click `Save and sync`

- go to the `Preview` tab to see your question. Try it out!

- if you go back to the question tab, you should see your new question.

Note that this question does not use any server side code, and for that reason, the file `server.py` is not needed. Indeed, you could just delete `server.py` for this question. (we will not remove the file for the purpose of the following steps of this tutorial).

## Start a new question from an existing one _inside_ your own course

- from the `Questions` tab, select the question you want to copy. As an example, we will use the question with QID `find_rectangle_area`.

- go to the `Settings` tab.

- click the button `Make a copy of this question`. Click `Submit` to make a copy of the question inside your own course. You are now viewing the copy of the question.

- click the button `Change QID` to change the question ID name. In this example, we will use `find_rectangle_area_rand`.

- click the `Edit question configuration` link to modify the `info.json` file.

- change the question `title`. In this case, you can just remove `(copy 1)` from the title, come up with another one, or leave it as is.

- you can change `topic` and `tags` as needed.

- click `Save and sync`.

### Change the content of the question

We will add randomization to the previous question, using the file [server.py](question/index.md#custom-generation-and-grading-serverpy)

- go to the `Files` tab.

- click the `Edit` button next to `server.py`. Here is where you can define the question variables, and add randomization. Here is a how we can modify the original area example:

  ```python title="server.py"
  import random
  def generate(data):
      # define the sides of the rectangle as random integers
      a = random.randint(2,5)
      b = random.randint(11,19)
      # store the sides in the dictionary "params"
      data["params"]["a"] = a
      data["params"]["b"] = b
      # define some typical distractors
      data["params"]["distractor1"] = (a*b)/2
      data["params"]["distractor2"] = 2*(a*b)
      data["params"]["distractor3"] = 2*(a+b)
      data["params"]["distractor4"] = (a+b)
      # define the correct answer
      data["params"]["truearea"] = a*b
  ```

- click `Save and sync`.

- go to the `Files` tab.

- click the `Edit` button next to `question.html`.

  ```html title="question.html"
  <pl-question-panel>
    <p>What is the area of a rectangle that has sides {{params.a}} and {{params.b}}?</p>
  </pl-question-panel>

  <pl-multiple-choice answers-name="area">
    <pl-answer correct="true">{{params.truearea}}</pl-answer>
    <pl-answer correct="false">{{params.distractor1}}</pl-answer>
    <pl-answer correct="false">{{params.distractor2}}</pl-answer>
    <pl-answer correct="false">{{params.distractor3}}</pl-answer>
    <pl-answer correct="false">{{params.distractor4}}</pl-answer>
  </pl-multiple-choice>
  ```

- click `Save and sync`.

- go to the `Preview` tab to see your question. Try it out! Check a different variant and see how the variables change.

## Start a new question from an existing one _outside_ your own course

### Copying questions from the example course (XC 101)

You should also have access to the example course `XC 101`. From the top menu, next to the PrairieLearn homepage button, you can select other courses that you were allowed access to. Select `XC 101`. If you cannot see the example course, contact us on Slack (`#pl-help`) and we will make sure you gain access.

You can look over all questions by going to the `Questions` tab. Or you can select course instance `SectionA` where some of the questions are organized by assessment. For example, `Question gallery for PL elements` will have a collection of examples for each PrairieLearn element. If you are interested in coding autograders, you can check `Questions using external auto-graders`.

Once you find a question that you want to use as template, you can follow these steps:

- click on the `Settings` tab.

- click the button `Make a copy of this question`. Select your course and click `Submit`.

- That is it! You are now viewing a copy of the question inside your course. You can modify the question following the steps from the section above.

### Copying questions from `www.prairielearn.com`

- Go to <https://www.prairielearn.com/catalog/questions>

- Browse through the questions until you find one that can be used as template for your course. Then click the button "Copy question".

- Select your course from the dropdown menu and click "Copy question".

- That is it! You are now viewing a copy of the question inside your course. You can modify the question following the steps from the section above.

## Creating a new assessment

Before you create an assessment, make sure you are in the desired course instance.

- click the button `Add assessment`.

- click the button `Change AID` to change the assessment ID name. In general, we use names such as `Homework1` or `Exam5`.

- click the `Edit` button next to `infoAssessment.json`.

- select the [assessment type](assessment/index.md#assessment-types) to be either `Homework` or `Exam`. For this example, we will use `Homework`.

- change the `title`. For example:

  ```json title="infoAssessment.json"
  {
    "title": "Geometric properties and applications"
  }
  ```

- you can change the assessment `set`, which is used for better organization of the course instance. PrairieLearn has some standardized sets (e.g. Homework, Quiz, Exam), and you can also [create your own](course/index.md#assessment-sets).

- change the number of the assessment (within its set). This number will be used to sort the assessments in the `Assessment` page.

- in `allowAccess` you should set the dates in which you want the assessment to be available. Read the documentation about [Access controls](https://prairielearn.readthedocs.io/en/latest/accessControl/) to learn about the different configurations available. In this example, we will use:

  ```json title="infoAssessment.json"
  {
    "allowAccess": [
      {
        "startDate": "2020-09-01T20:00:00",
        "endDate": "2020-09-06T20:00:00",
        "credit": 100
      }
    ]
  }
  ```

- in `zones` you should enter the questions to be included in that assessment. We will add the two questions that we just created:

  ```json title="infoAssessment.json"
  {
    "zones": [
      {
        "questions": [
          { "id": "find_rectangle_area_rand", "points": 1, "maxPoints": 5 },
          { "id": "find_rectangle_area", "points": 1, "maxPoints": 1 }
        ]
      }
    ]
  }
  ```

- click `Save and sync`.

## Check how a student will see the assessment

Follow these steps to preview an assessment as a student:

- From the main assessment page (click `Assessments` on the top menu bar), switch to student view by using the dropdown menu next to your name on the top menu and select "Student view without access restrictions". This action will take you to the Student Assessment page.

- Select the desired assessment (in our example `Geometric properties and applications`).

- Browse through the questions included in the assessment. Submit answers and observe how the points are updated in the assessment overview page.

When using "Student view without access restrictions", you have access to all assessments, regardless of their start and end dates. If you want to have a preview of only the assessments available to the students at the current time, you should select "Student view" from the dropdown menu.

Learn more:

- [Quick reference guide about question structure and PrairieLearn elements](https://coatless.github.io/pl-cheatsheets/pdfs/prairielearn-authoring-cheatsheet.pdf)

- [Different ways to set up an assessment](assessment/index.md)

- [Detailed list of PrairieLearn elements](elements.md)
