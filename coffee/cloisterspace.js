(function() {
  var EDGE_TYPE_CITY, EDGE_TYPE_GRASS, EDGE_TYPE_ROAD, Edge, Tile, World, drawTile, edgeDefs, positions, tile, world, _i, _len, _ref;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
      if (turns !== 0) {
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
      }
    };
    Tile.prototype.reset = function() {
      if (this.rotation > 0) {
        return this.rotate(4 - this.rotation);
      }
    };
    Tile.prototype.connectableTo = function(other, from) {
      var oppositeDirection, to;
      oppositeDirection = {
        "north": "south",
        "east": "west",
        "south": "north",
        "west": "east"
      };
      to = oppositeDirection[from];
      return this.edges[from].edge === other.edges[to].edge;
    };
    return Tile;
  })();
  World = (function() {
    function World() {
      var i;
      this.tiles = this.generateRandomTileSet();
      this.center = this.minrow = this.maxrow = this.mincol = this.maxcol = this.tiles.length;
      this.board = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.center * 2; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
          _results.push(new Array(this.center * 2));
        }
        return _results;
      }).call(this);
      this.placeTile(this.center, this.center, this.tiles.shift());
    }
    World.prototype.generateRandomTileSet = function() {
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
    World.prototype.findValidPositions = function(tile) {
      var adjacents, candidates, col, invalids, offsets, other, row, side, turns, valids, _ref, _ref2, _ref3, _ref4;
      adjacents = {
        north: {
          row: -1,
          col: 0
        },
        east: {
          row: 0,
          col: 1
        },
        south: {
          row: 1,
          col: 0
        },
        west: {
          row: 0,
          col: -1
        }
      };
      candidates = [];
      for (row = _ref = this.minrow - 1, _ref2 = this.maxrow + 1; _ref <= _ref2 ? row <= _ref2 : row >= _ref2; _ref <= _ref2 ? row++ : row--) {
        for (col = _ref3 = this.mincol - 1, _ref4 = this.maxcol + 1; _ref3 <= _ref4 ? col <= _ref4 : col >= _ref4; _ref3 <= _ref4 ? col++ : col--) {
          if (!(this.board[row][col] != null)) {
            for (turns = 0; turns <= 3; turns++) {
              tile.rotate(turns);
              valids = 0;
              invalids = 0;
              for (side in adjacents) {
                offsets = adjacents[side];
                other = this.board[row + offsets.row][col + offsets.col];
                if (other != null) {
                  if (tile.connectableTo(other, side)) {
                    valids++;
                  } else {
                    invalids++;
                  }
                }
              }
              if (valids > 0 && invalids === 0) {
                candidates.push([row, col, turns]);
              }
              tile.reset();
            }
          }
        }
      }
      return candidates;
    };
    World.prototype.placeTile = function(row, col, tile) {
      this.board[row][col] = tile;
      this.maxrow = Math.max(this.maxrow, row);
      this.minrow = Math.min(this.minrow, row);
      this.maxcol = Math.max(this.maxcol, col);
      return this.mincol = Math.min(this.mincol, col);
    };
    World.prototype.randomlyPlaceTile = function(tile, candidates) {
      var col, i, row, turns, _ref;
      if (candidates.length > 0) {
        i = Math.round(Math.random() * (candidates.length - 1));
        _ref = candidates[i], row = _ref[0], col = _ref[1], turns = _ref[2];
        if (turns > 0) {
          tile.rotate(turns);
        }
        return this.placeTile(row, col, tile);
      }
    };
    World.prototype.drawBoard = function() {
      var col, row, table, tbody, td, tile, tr, _ref, _ref2, _ref3, _ref4;
      table = $("<table><tbody></tbody></table>");
      tbody = table.find("tbody");
      for (row = _ref = this.minrow - 1, _ref2 = this.maxrow + 1; _ref <= _ref2 ? row <= _ref2 : row >= _ref2; _ref <= _ref2 ? row++ : row--) {
        tr = $("<tr></tr>");
        for (col = _ref3 = this.mincol - 1, _ref4 = this.maxcol + 1; _ref3 <= _ref4 ? col <= _ref4 : col >= _ref4; _ref3 <= _ref4 ? col++ : col--) {
          td = $("<td row='" + row + "' col='" + col + "'></td>");
          tile = this.board[row][col];
          if (tile != null) {
            td = $("<td row='" + row + "' col='" + col + "'>" + "<img src='img/" + tile.image + "' class='" + tile.rotationClass + "'/></td>");
          }
          tr.append(td);
        }
        tbody.append(tr);
      }
      return $("#board").empty().append(table);
    };
    return World;
  })();
  drawTile = function(world, tile, candidateLocations) {
    var candidates, col, locations, rotation, row;
    $('#candidate').attr('src', 'img/' + tile.image).attr('class', tile.rotationClass);
    candidates = (function() {
      var _i, _len, _ref, _results;
      _ref = candidateLocations[tile.rotation];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        locations = _ref[_i];
        row = locations[0], col = locations[1], rotation = locations[2];
        _results.push($("td[row=" + row + "][col=" + col + "]").attr('class', 'candidate').click(__bind(function() {
          var candidate, _j, _len2;
          for (_j = 0, _len2 = candidates.length; _j < _len2; _j++) {
            candidate = candidates[_j];
            candidate.attr('class', '').unbind();
            world[row][col] = tile;
          }
          return drawWorld(world);
        }, this)));
      }
      return _results;
    }).call(this);
    $('#left').unbind().click(function() {
      var candidate, _i, _len;
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        candidate = candidates[_i];
        candidate.attr('class', '').unbind();
      }
      tile.rotate(-1);
      return drawTile(tile, candidateLocations);
    });
    return $('#right').unbind().click(function() {
      var candidate, _i, _len;
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        candidate = candidates[_i];
        candidate.attr('class', '').unbind();
      }
      tile.rotate(1);
      return drawTile(tile, candidateLocations);
    });
  };
  world = new World();
  _ref = world.tiles;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    tile = _ref[_i];
    positions = world.findValidPositions(tile);
    world.randomlyPlaceTile(tile, positions);
  }
  world.drawBoard();
}).call(this);
