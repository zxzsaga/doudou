define({ "api": [
  {
    "type": "post",
    "url": "/game/create",
    "title": "Create game",
    "sampleRequest": [
      {
        "url": "http://localhost:3000/game/create"
      }
    ],
    "name": "CreateGame",
    "group": "Game",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Game name.</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "developer",
            "description": "<p>Game developer.</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Game description.</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "app/routers/GameRouter.js",
    "groupTitle": "Game"
  },
  {
    "type": "post",
    "url": "/game/rating/:id",
    "title": "Rating game",
    "name": "RatingGame",
    "group": "Game",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Game id</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "overall",
            "description": "<p>Overall rating</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "presentation",
            "description": "<p>Presentation rating</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "graphics",
            "description": "<p>Graphics rating</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "sound",
            "description": "<p>Sound rating</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "gameplay",
            "description": "<p>GamePlay rating</p> "
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "lastingAppeal",
            "description": "<p>LastingAppeal rating</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>Game comment</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "app/routers/GameRouter.js",
    "groupTitle": "Game"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "User login",
    "name": "UserLogin",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>User name</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pwd",
            "description": "<p>Password</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "app/routers/UserRouter.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/register",
    "title": "User register",
    "name": "UserRegister",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>User name</p> "
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pwd",
            "description": "<p>Password</p> "
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "app/routers/UserRouter.js",
    "groupTitle": "User"
  }
] });