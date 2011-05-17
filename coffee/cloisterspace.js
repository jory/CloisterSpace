(function() {
  var EDGE_TYPE_CITY, EDGE_TYPE_GRASS, EDGE_TYPE_ROAD, Edge, Tile, createWorldObject, edgeDefs, findValidPositions, generateRandomTileSet, tiles, world;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
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
      this.string = 'edge: ' + this.edge + ', road: ' + this.road + ', city: ' + this.city + ', grass: ' + this.grass + ', grassEdges: ' + this.grassEdges;
    }
    return Edge;
  })();
  Tile = (function() {
    function Tile(image, north, east, south, west, hasTwoCities, hasRoadEnd, isStart) {
      this.image = image;
      this.hasTwoCities = hasTwoCities;
      this.hasRoadEnd = hasRoadEnd;
      this.isStart = isStart;
      this.edges = {
        north: north,
        east: east,
        south: south,
        west: west
      };
      this.rotation = 0;
      this.rotationClass = 'r0';
    }
    Tile.prototype.rotate = function(turns) {
      var i, tmp, _i, _ref, _results, _results2;
      if (__indexOf.call((function() {
        _results = [];
        for (var _i = _ref = -3; _ref <= 3 ? _i <= 3 : _i >= 3; _ref <= 3 ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this, arguments), turns) < 0) {
        throw 'Invalid Rotation';
      }
      if (turns === 0) {
        return;
      }
      switch (turns) {
        case -1:
          turns = 3;
          break;
        case -2:
          turns = 2;
          break;
        case -3:
          turns = 1;
      }
      this.rotation += turns;
      if (this.rotation > 3) {
        this.rotation -= 4;
      }
      this.rotationClass = 'r' + this.rotation;
      _results2 = [];
      for (i = 1; 1 <= turns ? i <= turns : i >= turns; 1 <= turns ? i++ : i--) {
        tmp = this.edges.north;
        this.edges.north = this.edges.west;
        this.edges.west = this.edges.south;
        this.edges.south = this.edges.east;
        _results2.push(this.edges.east = tmp);
      }
      return _results2;
    };
    return Tile;
  })();
  generateRandomTileSet = function() {
    var city, count, east, edge, edges, grass, hasRoadEnd, hasTwoCities, i, image, isStart, north, regExp, road, roadEdgeCount, south, tile, tileDef, tileDefinitions, tileSets, tiles, west, _ref;
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
        road = tile[5].split('');
        city = tile[6].split('');
        grass = tile[7].split('');
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
        hasRoadEnd = roadEdgeCount === (1 || 3 || 4);
        north = new Edge(edgeDefs[edges[0]], road[0], city[0], grass[0], grass[1]);
        east = new Edge(edgeDefs[edges[1]], road[1], city[1], grass[2], grass[3]);
        south = new Edge(edgeDefs[edges[2]], road[2], city[2], grass[4], grass[5]);
        west = new Edge(edgeDefs[edges[3]], road[3], city[3], grass[6], grass[7]);
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (i = 1; 1 <= count ? i <= count : i >= count; 1 <= count ? i++ : i--) {
            _results2.push(new Tile(image, north, east, south, west, hasTwoCities, hasRoadEnd, isStart));
          }
          return _results2;
        })());
      }
      return _results;
    })();
    tiles = (_ref = []).concat.apply(_ref, tileSets);
    return [tiles[0]].concat(_(tiles.slice(1, (tiles.length + 1) || 9e9)).sortBy(function() {
      return Math.random();
    }));
  };
  createWorldObject = function(tiles) {
    var board, center, i, worldObject;
    center = tiles.length;
    board = (function() {
      var _ref, _results;
      _results = [];
      for (i = 1, _ref = center * 2; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
        _results.push(new Array(center * 2));
      }
      return _results;
    })();
    board[center][center] = tiles.shift();
    return worldObject = {
      board: board,
      center: center,
      minrow: center,
      maxrow: center,
      mincol: center,
      maxcol: center
    };
  };
  findValidPositions = function(world, tile) {
    var col, occupied, positions, row;
    return positions = (function() {
      var _ref, _ref2, _results;
      _results = [];
      for (row = _ref = world.minrow - 1, _ref2 = world.maxrow + 1; _ref <= _ref2 ? row <= _ref2 : row >= _ref2; _ref <= _ref2 ? row++ : row--) {
        _results.push((function() {
          var _ref3, _ref4, _results2;
          _results2 = [];
          for (col = _ref3 = world.mincol - 1, _ref4 = world.maxcol + 1; _ref3 <= _ref4 ? col <= _ref4 : col >= _ref4; _ref3 <= _ref4 ? col++ : col--) {
            occupied = world.board[row][col];
            _results2.push(!(occupied != null) ? console.log(row + ',' + col) : void 0);
          }
          return _results2;
        })());
      }
      return _results;
    })();
  };
  tiles = generateRandomTileSet();
  world = createWorldObject(tiles);
  findValidPositions(world, tiles[0]);
}).call(this);
