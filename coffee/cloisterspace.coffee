EDGE_TYPE_CITY = 'city'
EDGE_TYPE_GRASS = 'grass'
EDGE_TYPE_ROAD = 'road'

edgeDefs = {
  'r': EDGE_TYPE_ROAD,
  'g': EDGE_TYPE_GRASS,
  'c': EDGE_TYPE_CITY
}


class Edge
  constructor: (@edge, @road, @city, @grass, @grassEdges) ->


class Tile
  constructor: (@image, @north, @east, @south, @west, @hasTwoCities, @hasRoadEnd, @isStart) ->
    @rotation = 0
    @rotationClass = ''


generateRandomTileSet = ->
  startTime = (new Date()).getTime();

  # order of edge specs is NESW
  #
  # More edge details:
  # RoadMap (order NESW),
  # CityMap (order NESW),
  # GrassMap (clockwise-order starting from top-edge on the left side.
  #           Or in compass notation: NNW,NNE,ENE,ESE,SSE,SSW,WSW,WNW)

  tileDefinitions = [
      'city1rwe.png   1   start crgr    --  -1-1    1---    --122221',
      'city1rwe.png   3   reg   crgr    --  -1-1    1---    --122221',
      'city4.png      1   reg   cccc    --  ----    1111    --------',
      'road4.png      1   reg   rrrr    --  1234    ----    12233441',
      'city3.png      3   reg   ccgc    --  ----    11-1    ----11--',
      'city3s.png     1   reg   ccgc    --  ----    11-1    ----11--',
      'city3r.png     1   reg   ccrc    --  --1-    11-1    ----12--',
      'city3sr.png    2   reg   ccrc    --  --1-    11-1    ----12--',
      'road3.png      4   reg   grrr    --  -123    ----    11122331',
      'city2we.png    1   reg   gcgc    --  ----    -1-1    11--22--',
      'city2wes.png   2   reg   gcgc    --  ----    -1-1    11--22--',
      'road2ns.png    8   reg   rgrg    --  1-1-    ----    12222111',
      'city2nw.png    3   reg   cggc    --  ----    1--1    --1111--',
      'city2nws.png   2   reg   cggc    --  ----    1--1    --1111--',
      'city2nwr.png   3   reg   crrc    --  -11-    1--1    --1221--',
      'city2nwsr.png  2   reg   crrc    --  -11-    1--1    --1221--',
      'road2sw.png    9   reg   ggrr    --  --11    ----    11111221',
      'city11ne.png   2   reg   ccgg    11  ----    12--    ----1111',
      'city11we.png   3   reg   gcgc    11  ----    -1-2    11--11--',
      'cloisterr.png  2   reg   ggrg    --  --1-    ----    11111111',
      'cloister.png   4   reg   gggg    --  ----    ----    11111111',
      'city1.png      5   reg   cggg    --  ----    1---    --111111',
      'city1rse.png   3   reg   crrg    --  -11-    1---    --122111',
      'city1rsw.png   3   reg   cgrr    --  --11    1---    --111221',
      'city1rswe.png  3   reg   crrr    --  -123    1---    --122331'
    ]

  tileSets = for tileDef in tileDefinitions
    regExp = RegExp(' +', 'g')
    tile = tileDef.replace(regExp, ' ').split(' ')

    count = tile[1]

    image = tile[0]
    isStart = tile[2] is 'start'
    hasTwoCities = tile[4] is '11'

    edges = tile[3].split('')
    roadEdges = tile[5].split('')
    cityEdges = tile[6].split('')
    grassEdges = tile[7].split('')

    roadEdgeCount = (edge for edge in edges when edge is 'r').length

    north = new Edge(edgeDefs[edges[0]], roadEdges[0], cityEdges[0], grassEdges[0],
                     grassEdges[1])
    east = new Edge(edgeDefs[edges[1]], roadEdges[1], cityEdges[1], grassEdges[2],
                    grassEdges[3])
    south = new Edge(edgeDefs[edges[2]], roadEdges[2], cityEdges[2], grassEdges[4],
                     grassEdges[5])
    west = new Edge(edgeDefs[edges[3]], roadEdges[3], cityEdges[3], grassEdges[6],
                    grassEdges[7])

    for i in [1..count]
      new Tile(image, north, east, south, west, hasTwoCities,
               roadEdgeCount is (1 or 3 or 4), isStart)

  tiles = [].concat tileSets...

  [tiles[0]].concat _(tiles[1..tiles.length]).sortBy(-> Math.random())

tiles = generateRandomTileSet()
