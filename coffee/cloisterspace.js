(function() {
  var EDGE_TYPE_CITY, EDGE_TYPE_GRASS, EDGE_TYPE_ROAD, Edge, Tile, edgeDefs, generateRandomTileSet, tiles;
  EDGE_TYPE_CITY = 'city';
  EDGE_TYPE_GRASS = 'grass';
  EDGE_TYPE_ROAD = 'road';
  edgeDefs = {
    'r': EDGE_TYPE_ROAD,
    'g': EDGE_TYPE_GRASS,
    'c': EDGE_TYPE_CITY
  };
  Edge = (function() {
    function Edge(edge, road, city, grass, grassEdges) {
      this.edge = edge;
      this.road = road;
      this.city = city;
      this.grass = grass;
      this.grassEdges = grassEdges;
    }
    return Edge;
  })();
  Tile = (function() {
    function Tile(image, north, east, south, west, hasTwoCities, hasRoadEnd, isStart) {
      this.image = image;
      this.north = north;
      this.east = east;
      this.south = south;
      this.west = west;
      this.hasTwoCities = hasTwoCities;
      this.hasRoadEnd = hasRoadEnd;
      this.isStart = isStart;
      this.rotation = 0;
      this.rotationClass = '';
    }
    return Tile;
  })();
  generateRandomTileSet = function() {
    var cityEdges, count, east, edge, edges, grassEdges, hasTwoCities, i, image, isStart, north, regExp, roadEdgeCount, roadEdges, south, startTime, tile, tileDef, tileDefinitions, tileSets, tiles, west, _ref;
    startTime = (new Date()).getTime();
    tileDefinitions = ['city1rwe.png   1   start crgr    --  -1-1    1---    --122221', 'city1rwe.png   3   reg   crgr    --  -1-1    1---    --122221', 'city4.png      1   reg   cccc    --  ----    1111    --------', 'road4.png      1   reg   rrrr    --  1234    ----    12233441', 'city3.png      3   reg   ccgc    --  ----    11-1    ----11--', 'city3s.png     1   reg   ccgc    --  ----    11-1    ----11--', 'city3r.png     1   reg   ccrc    --  --1-    11-1    ----12--', 'city3sr.png    2   reg   ccrc    --  --1-    11-1    ----12--', 'road3.png      4   reg   grrr    --  -123    ----    11122331', 'city2we.png    1   reg   gcgc    --  ----    -1-1    11--22--', 'city2wes.png   2   reg   gcgc    --  ----    -1-1    11--22--', 'road2ns.png    8   reg   rgrg    --  1-1-    ----    12222111', 'city2nw.png    3   reg   cggc    --  ----    1--1    --1111--', 'city2nws.png   2   reg   cggc    --  ----    1--1    --1111--', 'city2nwr.png   3   reg   crrc    --  -11-    1--1    --1221--', 'city2nwsr.png  2   reg   crrc    --  -11-    1--1    --1221--', 'road2sw.png    9   reg   ggrr    --  --11    ----    11111221', 'city11ne.png   2   reg   ccgg    11  ----    12--    ----1111', 'city11we.png   3   reg   gcgc    11  ----    -1-2    11--11--', 'cloisterr.png  2   reg   ggrg    --  --1-    ----    11111111', 'cloister.png   4   reg   gggg    --  ----    ----    11111111', 'city1.png      5   reg   cggg    --  ----    1---    --111111', 'city1rse.png   3   reg   crrg    --  -11-    1---    --122111', 'city1rsw.png   3   reg   cgrr    --  --11    1---    --111221', 'city1rswe.png  3   reg   crrr    --  -123    1---    --122331'];
    tileSets = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tileDefinitions.length; _i < _len; _i++) {
        tileDef = tileDefinitions[_i];
        regExp = RegExp(' +', 'g');
        tile = tileDef.replace(regExp, ' ').split(' ');
        count = tile[1];
        image = tile[0];
        isStart = tile[2] === 'start';
        hasTwoCities = tile[4] === '11';
        edges = tile[3].split('');
        roadEdges = tile[5].split('');
        cityEdges = tile[6].split('');
        grassEdges = tile[7].split('');
        roadEdgeCount = ((function() {
          var _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = edges.length; _j < _len2; _j++) {
            edge = edges[_j];
            if (edge === 'r') {
              _results2.push(edge);
            }
          }
          return _results2;
        })()).length;
        north = new Edge(edgeDefs[edges[0]], roadEdges[0], cityEdges[0], grassEdges[0], grassEdges[1]);
        east = new Edge(edgeDefs[edges[1]], roadEdges[1], cityEdges[1], grassEdges[2], grassEdges[3]);
        south = new Edge(edgeDefs[edges[2]], roadEdges[2], cityEdges[2], grassEdges[4], grassEdges[5]);
        west = new Edge(edgeDefs[edges[3]], roadEdges[3], cityEdges[3], grassEdges[6], grassEdges[7]);
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (i = 1; 1 <= count ? i <= count : i >= count; 1 <= count ? i++ : i--) {
            _results2.push(new Tile(image, north, east, south, west, hasTwoCities, roadEdgeCount === (1 || 3 || 4), isStart));
          }
          return _results2;
        })());
      }
      return _results;
    })();
    tiles = (_ref = []).concat.apply(_ref, tileSets);
    return [tiles[0]].concat(_.sortBy(tiles.slice(1, (tiles.length + 1) || 9e9), function() {
      return Math.random();
    }));
  };
  tiles = generateRandomTileSet();
}).call(this);
