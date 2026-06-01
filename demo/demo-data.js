"use strict";

window.DemoData = {
  "levels": {
    "hardpoint-gallery": {
      "id": "hardpoint-gallery",
      "title": "Hardpoint Gallery",
      "walls": [
        {
          "x": 0,
          "y": 0,
          "w": 960,
          "h": 20
        },
        {
          "x": 0,
          "y": 620,
          "w": 960,
          "h": 20
        },
        {
          "x": 0,
          "y": 0,
          "w": 20,
          "h": 640
        },
        {
          "x": 940,
          "y": 0,
          "w": 20,
          "h": 640
        },
        {
          "x": 120,
          "y": 90,
          "w": 690,
          "h": 20
        },
        {
          "x": 120,
          "y": 510,
          "w": 690,
          "h": 20
        },
        {
          "x": 120,
          "y": 90,
          "w": 20,
          "h": 175
        },
        {
          "x": 120,
          "y": 375,
          "w": 20,
          "h": 155
        },
        {
          "x": 790,
          "y": 90,
          "w": 20,
          "h": 155
        },
        {
          "x": 790,
          "y": 355,
          "w": 20,
          "h": 175
        },
        {
          "x": 295,
          "y": 90,
          "w": 20,
          "h": 110
        },
        {
          "x": 295,
          "y": 310,
          "w": 20,
          "h": 200
        },
        {
          "x": 500,
          "y": 90,
          "w": 20,
          "h": 150
        },
        {
          "x": 500,
          "y": 350,
          "w": 20,
          "h": 160
        },
        {
          "x": 315,
          "y": 250,
          "w": 65,
          "h": 20
        },
        {
          "x": 450,
          "y": 250,
          "w": 50,
          "h": 20
        },
        {
          "x": 520,
          "y": 250,
          "w": 40,
          "h": 20
        },
        {
          "x": 670,
          "y": 250,
          "w": 120,
          "h": 20
        },
        {
          "x": 315,
          "y": 380,
          "w": 65,
          "h": 20
        },
        {
          "x": 450,
          "y": 380,
          "w": 50,
          "h": 20
        },
        {
          "x": 520,
          "y": 380,
          "w": 40,
          "h": 20
        },
        {
          "x": 670,
          "y": 380,
          "w": 120,
          "h": 20
        },
        {
          "x": 650,
          "y": 270,
          "w": 20,
          "h": 110
        },
        {
          "x": 140,
          "y": 340,
          "w": 155,
          "h": 20
        },
        {
          "x": 380,
          "y": 110,
          "w": 20,
          "h": 50
        },
        {
          "x": 705,
          "y": 400,
          "w": 20,
          "h": 70
        }
      ],
      "doors": [
        {
          "id": "entry-west",
          "x": 120,
          "y": 265,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "office",
          "x": 295,
          "y": 200,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "lounge",
          "x": 500,
          "y": 240,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "upper-storage",
          "x": 380,
          "y": 250,
          "w": 70,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "lower-storage",
          "x": 380,
          "y": 380,
          "w": 70,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "hall-east",
          "x": 790,
          "y": 245,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "center-north",
          "x": 560,
          "y": 250,
          "w": 110,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "center-south",
          "x": 560,
          "y": 380,
          "w": 110,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        }
      ],
      "operators": [
        {
          "id": "ALPHA",
          "x": 72,
          "y": 248,
          "color": "#67c98f"
        },
        {
          "id": "BRAVO",
          "x": 72,
          "y": 392,
          "color": "#72b7ce"
        }
      ],
      "enemies": [
        {
          "id": "E1",
          "x": 410,
          "y": 170,
          "angle": 3.141592653589793,
          "watch": {
            "x": 415,
            "y": 260
          },
          "patrol": [
            {
              "x": 410,
              "y": 170
            },
            {
              "x": 455,
              "y": 220
            }
          ]
        },
        {
          "id": "E2",
          "x": 720,
          "y": 175,
          "angle": 2.356194490192345,
          "watch": {
            "x": 615,
            "y": 260
          },
          "patrol": [
            {
              "x": 720,
              "y": 175
            },
            {
              "x": 735,
              "y": 330
            }
          ]
        },
        {
          "id": "E3",
          "x": 590,
          "y": 455,
          "angle": 3.9269908169872414,
          "watch": {
            "x": 615,
            "y": 390
          },
          "patrol": [
            {
              "x": 590,
              "y": 455
            },
            {
              "x": 690,
              "y": 455
            }
          ]
        },
        {
          "id": "E4",
          "x": 355,
          "y": 445,
          "angle": 3.141592653589793,
          "watch": {
            "x": 415,
            "y": 390
          },
          "patrol": [
            {
              "x": 355,
              "y": 445
            },
            {
              "x": 470,
              "y": 445
            }
          ]
        },
        {
          "id": "E5",
          "x": 610,
          "y": 315,
          "angle": 3.141592653589793,
          "watch": {
            "x": 615,
            "y": 260
          },
          "patrol": [
            {
              "x": 610,
              "y": 315
            },
            {
              "x": 725,
              "y": 315
            }
          ]
        }
      ],
      "objective": {
        "x": 735,
        "y": 455,
        "radius": 16,
        "secured": false,
        "harmed": false
      }
    },
    "ridge-house-entry": {
      "id": "ridge-house-entry",
      "title": "Ridge House Entry",
      "walls": [
        {
          "x": 0,
          "y": 0,
          "w": 960,
          "h": 20
        },
        {
          "x": 0,
          "y": 620,
          "w": 960,
          "h": 20
        },
        {
          "x": 0,
          "y": 0,
          "w": 20,
          "h": 640
        },
        {
          "x": 940,
          "y": 0,
          "w": 20,
          "h": 640
        },
        {
          "x": 120,
          "y": 90,
          "w": 690,
          "h": 20
        },
        {
          "x": 120,
          "y": 510,
          "w": 690,
          "h": 20
        },
        {
          "x": 120,
          "y": 90,
          "w": 20,
          "h": 175
        },
        {
          "x": 120,
          "y": 375,
          "w": 20,
          "h": 155
        },
        {
          "x": 790,
          "y": 90,
          "w": 20,
          "h": 155
        },
        {
          "x": 790,
          "y": 355,
          "w": 20,
          "h": 175
        },
        {
          "x": 295,
          "y": 90,
          "w": 20,
          "h": 110
        },
        {
          "x": 295,
          "y": 310,
          "w": 20,
          "h": 200
        },
        {
          "x": 500,
          "y": 90,
          "w": 20,
          "h": 150
        },
        {
          "x": 500,
          "y": 350,
          "w": 20,
          "h": 160
        },
        {
          "x": 315,
          "y": 250,
          "w": 65,
          "h": 20
        },
        {
          "x": 450,
          "y": 250,
          "w": 50,
          "h": 20
        },
        {
          "x": 520,
          "y": 250,
          "w": 40,
          "h": 20
        },
        {
          "x": 670,
          "y": 250,
          "w": 120,
          "h": 20
        },
        {
          "x": 315,
          "y": 380,
          "w": 65,
          "h": 20
        },
        {
          "x": 450,
          "y": 380,
          "w": 50,
          "h": 20
        },
        {
          "x": 520,
          "y": 380,
          "w": 40,
          "h": 20
        },
        {
          "x": 670,
          "y": 380,
          "w": 120,
          "h": 20
        },
        {
          "x": 650,
          "y": 270,
          "w": 20,
          "h": 110
        },
        {
          "x": 140,
          "y": 340,
          "w": 155,
          "h": 20
        }
      ],
      "doors": [
        {
          "id": "entry-west",
          "x": 120,
          "y": 265,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed",
          "lockType": "digital",
          "password": "0000",
          "locked": true
        },
        {
          "id": "office",
          "x": 295,
          "y": 200,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "lounge",
          "x": 500,
          "y": 240,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "upper-storage",
          "x": 380,
          "y": 250,
          "w": 70,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "lower-storage",
          "x": 380,
          "y": 380,
          "w": 70,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "hall-east",
          "x": 790,
          "y": 245,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "center-north",
          "x": 560,
          "y": 250,
          "w": 110,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "center-south",
          "x": 560,
          "y": 380,
          "w": 110,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        }
      ],
      "operators": [
        {
          "id": "ALPHA",
          "x": 72,
          "y": 276,
          "color": "#67c98f"
        },
        {
          "id": "BRAVO",
          "x": 72,
          "y": 364,
          "color": "#72b7ce"
        }
      ],
      "enemies": [
        {
          "id": "E1",
          "x": 410,
          "y": 174,
          "angle": 3.141592653589793,
          "watch": {
            "x": 415,
            "y": 260
          },
          "patrol": [
            {
              "x": 410,
              "y": 174
            },
            {
              "x": 425,
              "y": 220
            }
          ]
        },
        {
          "id": "E2",
          "x": 720,
          "y": 180,
          "angle": 1.7278759594743864,
          "watch": {
            "x": 615,
            "y": 260
          },
          "patrol": [
            {
              "x": 720,
              "y": 180
            },
            {
              "x": 735,
              "y": 320
            }
          ]
        },
        {
          "id": "E3",
          "x": 600,
          "y": 455,
          "angle": 3.9269908169872414,
          "watch": {
            "x": 615,
            "y": 390
          },
          "patrol": [
            {
              "x": 600,
              "y": 455
            },
            {
              "x": 705,
              "y": 455
            }
          ]
        }
      ],
      "objective": {
        "x": 720,
        "y": 452,
        "radius": 16,
        "secured": false,
        "harmed": false
      }
    },
    "terminal-breach": {
      "id": "terminal-breach",
      "title": "Terminal Breach",
      "width": 1280,
      "height": 800,
      "floorZones": [
        {
          "x": 140,
          "y": 120,
          "w": 220,
          "h": 240
        },
        {
          "x": 380,
          "y": 120,
          "w": 240,
          "h": 240
        },
        {
          "x": 640,
          "y": 120,
          "w": 240,
          "h": 240
        },
        {
          "x": 900,
          "y": 120,
          "w": 220,
          "h": 240
        },
        {
          "x": 140,
          "y": 380,
          "w": 220,
          "h": 180
        },
        {
          "x": 380,
          "y": 380,
          "w": 240,
          "h": 180
        },
        {
          "x": 640,
          "y": 380,
          "w": 240,
          "h": 180
        },
        {
          "x": 900,
          "y": 380,
          "w": 220,
          "h": 180
        },
        {
          "x": 140,
          "y": 580,
          "w": 480,
          "h": 120
        },
        {
          "x": 640,
          "y": 580,
          "w": 480,
          "h": 120
        }
      ],
      "walls": [
        {
          "x": 0,
          "y": 0,
          "w": 1280,
          "h": 20
        },
        {
          "x": 0,
          "y": 780,
          "w": 1280,
          "h": 20
        },
        {
          "x": 0,
          "y": 0,
          "w": 20,
          "h": 800
        },
        {
          "x": 1260,
          "y": 0,
          "w": 20,
          "h": 800
        },
        {
          "x": 120,
          "y": 100,
          "w": 1020,
          "h": 20
        },
        {
          "x": 120,
          "y": 700,
          "w": 1020,
          "h": 20
        },
        {
          "x": 120,
          "y": 100,
          "w": 20,
          "h": 210
        },
        {
          "x": 120,
          "y": 410,
          "w": 20,
          "h": 290
        },
        {
          "x": 1120,
          "y": 100,
          "w": 20,
          "h": 220
        },
        {
          "x": 1120,
          "y": 420,
          "w": 20,
          "h": 280
        },
        {
          "x": 360,
          "y": 100,
          "w": 20,
          "h": 120
        },
        {
          "x": 360,
          "y": 330,
          "w": 20,
          "h": 190
        },
        {
          "x": 360,
          "y": 630,
          "w": 20,
          "h": 70
        },
        {
          "x": 620,
          "y": 100,
          "w": 20,
          "h": 150
        },
        {
          "x": 620,
          "y": 360,
          "w": 20,
          "h": 160
        },
        {
          "x": 620,
          "y": 630,
          "w": 20,
          "h": 70
        },
        {
          "x": 880,
          "y": 100,
          "w": 20,
          "h": 180
        },
        {
          "x": 880,
          "y": 390,
          "w": 20,
          "h": 130
        },
        {
          "x": 880,
          "y": 630,
          "w": 20,
          "h": 70
        },
        {
          "x": 140,
          "y": 360,
          "w": 110,
          "h": 20
        },
        {
          "x": 330,
          "y": 360,
          "w": 290,
          "h": 20
        },
        {
          "x": 640,
          "y": 360,
          "w": 110,
          "h": 20
        },
        {
          "x": 830,
          "y": 360,
          "w": 290,
          "h": 20
        },
        {
          "x": 140,
          "y": 560,
          "w": 190,
          "h": 20
        },
        {
          "x": 430,
          "y": 560,
          "w": 190,
          "h": 20
        },
        {
          "x": 640,
          "y": 560,
          "w": 190,
          "h": 20
        },
        {
          "x": 930,
          "y": 560,
          "w": 190,
          "h": 20
        },
        {
          "x": 500,
          "y": 420,
          "w": 20,
          "h": 120
        },
        {
          "x": 760,
          "y": 420,
          "w": 20,
          "h": 120
        },
        {
          "x": 1010,
          "y": 140,
          "w": 20,
          "h": 130
        },
        {
          "x": 250,
          "y": 590,
          "w": 20,
          "h": 90
        }
      ],
      "doors": [
        {
          "id": "entry-west",
          "x": 120,
          "y": 310,
          "w": 20,
          "h": 100,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "east-entry",
          "x": 1120,
          "y": 320,
          "w": 20,
          "h": 100,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "alpha-office",
          "x": 360,
          "y": 220,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "server-core",
          "x": 620,
          "y": 250,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "archive",
          "x": 880,
          "y": 280,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "lower-west",
          "x": 360,
          "y": 520,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "lower-core",
          "x": 620,
          "y": 520,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "lower-east",
          "x": 880,
          "y": 520,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "north-hall-a",
          "x": 250,
          "y": 360,
          "w": 80,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "north-hall-b",
          "x": 750,
          "y": 360,
          "w": 80,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "south-hall-a",
          "x": 330,
          "y": 560,
          "w": 100,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "south-hall-b",
          "x": 830,
          "y": 560,
          "w": 100,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        }
      ],
      "operators": [
        {
          "id": "ALPHA",
          "x": 72,
          "y": 300,
          "color": "#67c98f"
        },
        {
          "id": "BRAVO",
          "x": 72,
          "y": 420,
          "color": "#72b7ce"
        }
      ],
      "enemies": [
        {
          "id": "E1",
          "x": 250,
          "y": 210,
          "angle": 3.141592653589793,
          "watch": {
            "x": 370,
            "y": 275
          },
          "patrol": [
            {
              "x": 250,
              "y": 210
            },
            {
              "x": 315,
              "y": 300
            }
          ]
        },
        {
          "id": "E2",
          "x": 510,
          "y": 205,
          "angle": 2.356194490192345,
          "watch": {
            "x": 630,
            "y": 305
          },
          "patrol": [
            {
              "x": 510,
              "y": 205
            },
            {
              "x": 575,
              "y": 315
            }
          ]
        },
        {
          "id": "E3",
          "x": 735,
          "y": 235,
          "angle": 3.141592653589793,
          "watch": {
            "x": 630,
            "y": 305
          },
          "patrol": [
            {
              "x": 735,
              "y": 235
            },
            {
              "x": 825,
              "y": 315
            }
          ]
        },
        {
          "id": "E4",
          "x": 1010,
          "y": 310,
          "angle": 2.356194490192345,
          "watch": {
            "x": 890,
            "y": 335
          },
          "patrol": [
            {
              "x": 1010,
              "y": 310
            },
            {
              "x": 935,
              "y": 205
            }
          ]
        },
        {
          "id": "E5",
          "x": 300,
          "y": 635,
          "angle": 3.141592653589793,
          "watch": {
            "x": 380,
            "y": 570
          },
          "patrol": [
            {
              "x": 300,
              "y": 635
            },
            {
              "x": 550,
              "y": 635
            }
          ]
        },
        {
          "id": "E6",
          "x": 710,
          "y": 640,
          "angle": 3.141592653589793,
          "watch": {
            "x": 630,
            "y": 575
          },
          "patrol": [
            {
              "x": 710,
              "y": 640
            },
            {
              "x": 880,
              "y": 640
            }
          ]
        },
        {
          "id": "E7",
          "x": 1015,
          "y": 640,
          "angle": 3.9269908169872414,
          "watch": {
            "x": 890,
            "y": 575
          },
          "patrol": [
            {
              "x": 1015,
              "y": 640
            },
            {
              "x": 930,
              "y": 455
            }
          ]
        }
      ],
      "objective": {
        "x": 1040,
        "y": 650,
        "radius": 16,
        "secured": false,
        "harmed": false
      }
    },
    "warehouse-pinch": {
      "id": "warehouse-pinch",
      "title": "Warehouse Pinch",
      "walls": [
        {
          "x": 0,
          "y": 0,
          "w": 960,
          "h": 20
        },
        {
          "x": 0,
          "y": 620,
          "w": 960,
          "h": 20
        },
        {
          "x": 0,
          "y": 0,
          "w": 20,
          "h": 640
        },
        {
          "x": 940,
          "y": 0,
          "w": 20,
          "h": 640
        },
        {
          "x": 120,
          "y": 90,
          "w": 690,
          "h": 20
        },
        {
          "x": 120,
          "y": 510,
          "w": 690,
          "h": 20
        },
        {
          "x": 120,
          "y": 90,
          "w": 20,
          "h": 175
        },
        {
          "x": 120,
          "y": 375,
          "w": 20,
          "h": 155
        },
        {
          "x": 790,
          "y": 90,
          "w": 20,
          "h": 155
        },
        {
          "x": 790,
          "y": 355,
          "w": 20,
          "h": 175
        },
        {
          "x": 295,
          "y": 90,
          "w": 20,
          "h": 110
        },
        {
          "x": 295,
          "y": 310,
          "w": 20,
          "h": 200
        },
        {
          "x": 500,
          "y": 90,
          "w": 20,
          "h": 150
        },
        {
          "x": 500,
          "y": 350,
          "w": 20,
          "h": 160
        },
        {
          "x": 315,
          "y": 250,
          "w": 65,
          "h": 20
        },
        {
          "x": 450,
          "y": 250,
          "w": 50,
          "h": 20
        },
        {
          "x": 520,
          "y": 250,
          "w": 40,
          "h": 20
        },
        {
          "x": 670,
          "y": 250,
          "w": 120,
          "h": 20
        },
        {
          "x": 315,
          "y": 380,
          "w": 65,
          "h": 20
        },
        {
          "x": 450,
          "y": 380,
          "w": 50,
          "h": 20
        },
        {
          "x": 520,
          "y": 380,
          "w": 40,
          "h": 20
        },
        {
          "x": 670,
          "y": 380,
          "w": 120,
          "h": 20
        },
        {
          "x": 650,
          "y": 270,
          "w": 20,
          "h": 110
        },
        {
          "x": 140,
          "y": 340,
          "w": 155,
          "h": 20
        },
        {
          "x": 430,
          "y": 410,
          "w": 20,
          "h": 100
        }
      ],
      "doors": [
        {
          "id": "entry-west",
          "x": 120,
          "y": 265,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "office",
          "x": 295,
          "y": 200,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "lounge",
          "x": 500,
          "y": 240,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "upper-storage",
          "x": 380,
          "y": 250,
          "w": 70,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "lower-storage",
          "x": 380,
          "y": 380,
          "w": 70,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "hall-east",
          "x": 790,
          "y": 245,
          "w": 20,
          "h": 110,
          "orientation": "vertical",
          "state": "closed"
        },
        {
          "id": "center-north",
          "x": 560,
          "y": 250,
          "w": 110,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        },
        {
          "id": "center-south",
          "x": 560,
          "y": 380,
          "w": 110,
          "h": 20,
          "orientation": "horizontal",
          "state": "closed"
        }
      ],
      "operators": [
        {
          "id": "ALPHA",
          "x": 72,
          "y": 260,
          "color": "#67c98f"
        },
        {
          "id": "BRAVO",
          "x": 72,
          "y": 380,
          "color": "#72b7ce"
        }
      ],
      "enemies": [
        {
          "id": "E1",
          "x": 400,
          "y": 174,
          "angle": 3.141592653589793,
          "watch": {
            "x": 415,
            "y": 260
          },
          "patrol": [
            {
              "x": 400,
              "y": 174
            },
            {
              "x": 450,
              "y": 215
            }
          ]
        },
        {
          "id": "E2",
          "x": 715,
          "y": 175,
          "angle": 2.356194490192345,
          "watch": {
            "x": 615,
            "y": 260
          },
          "patrol": [
            {
              "x": 715,
              "y": 175
            },
            {
              "x": 725,
              "y": 330
            }
          ]
        },
        {
          "id": "E3",
          "x": 590,
          "y": 455,
          "angle": 3.9269908169872414,
          "watch": {
            "x": 615,
            "y": 390
          },
          "patrol": [
            {
              "x": 590,
              "y": 455
            },
            {
              "x": 710,
              "y": 455
            }
          ]
        },
        {
          "id": "E4",
          "x": 360,
          "y": 445,
          "angle": 3.141592653589793,
          "watch": {
            "x": 415,
            "y": 390
          },
          "patrol": [
            {
              "x": 360,
              "y": 445
            },
            {
              "x": 470,
              "y": 445
            }
          ]
        }
      ],
      "objective": {
        "x": 735,
        "y": 452,
        "radius": 16,
        "secured": false,
        "harmed": false
      }
    }
  },
  "equipment": {
    "heavy-armor": {
      "id": "heavy-armor",
      "name": "Heavy Armor",
      "role": "High protection with slower movement",
      "armor": 80,
      "speedMultiplier": 0.88
    },
    "light-armor": {
      "id": "light-armor",
      "name": "Light Armor",
      "role": "Low-profile armor with full mobility",
      "armor": 25,
      "speedMultiplier": 1
    },
    "medium-armor": {
      "id": "medium-armor",
      "name": "Medium Armor",
      "role": "Balanced protection with a small mobility cost",
      "armor": 50,
      "speedMultiplier": 0.94
    },
    "pistol": {
      "id": "pistol",
      "name": "Pistol",
      "role": "Controlled sidearm",
      "range": 165,
      "damage": 24,
      "fireInterval": 0.38,
      "reactionDelay": 0.28,
      "tracerTtl": 0.1
    },
    "rifle": {
      "id": "rifle",
      "name": "Rifle",
      "role": "Balanced automatic rifle",
      "range": 245,
      "damage": 18,
      "fireInterval": 0.16,
      "reactionDelay": 0.4,
      "tracerTtl": 0.08
    },
    "smg": {
      "id": "smg",
      "name": "SMG",
      "role": "Fast close-quarters weapon",
      "range": 185,
      "damage": 12,
      "fireInterval": 0.08,
      "reactionDelay": 0.32,
      "tracerTtl": 0.06
    }
  }
};
