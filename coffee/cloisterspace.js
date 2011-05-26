(function() {
  var Edge, Road, Tile, World, positions, tile, world;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Array.prototype.remove = function(e) {
    var t, _ref;
    if ((t = this.indexOf(e)) > -1) {
      return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
    }
  };
  Edge = (function() {
    function Edge(type, road, city, grassA, grassB) {
      this.type = type;
      this.road = road;
      this.city = city;
      this.grassA = grassA;
      this.grassB = grassB;
      this.string = 'type: ' + this.type + ', road: ' + this.road + ', city: ' + this.city + ', grassA: ' + this.grassA + ', grassB: ' + this.grassB;
    }
    return Edge;
  })();
  Tile = (function() {
    var oppositeDirection;
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
    oppositeDirection = {
      "north": "south",
      "east": "west",
      "south": "north",
      "west": "east"
    };
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
      var to;
      to = oppositeDirection[from];
      return this.edges[from].type === other.edges[to].type;
    };
    return Tile;
  })();
  Road = (function() {
    function Road(row, col, edge, id, hasEnd) {
      var address;
      address = row + ',' + col;
      this.tiles = {};
      this.tiles[address] = true;
      this.ids = {};
      this.ids[address + ',' + id] = true;
      this.edges = {};
      this.edges[address + ',' + edge] = {
        row: row,
        col: col,
        edge: edge,
        id: id,
        hasEnd: hasEnd
      };
      this.length = 1;
      this.numEnds = hasEnd ? 1 : 0;
      this.finished = false;
    }
    Road.prototype.add = function(row, col, edge, id, hasEnd) {
      var address;
      address = row + ',' + col;
      if (!this.tiles[address]) {
        this.length += 1;
        this.tiles[address] = true;
      }
      this.ids[address + ',' + id] = true;
      this.edges[address + ',' + edge] = {
        row: row,
        col: col,
        edge: edge,
        id: id,
        hasEnd: hasEnd
      };
      if (hasEnd) {
        this.numEnds += 1;
        if (this.numEnds === 2) {
          return this.finished = true;
        }
      }
    };
    Road.prototype.has = function(row, col, id) {
      return this.ids[row + ',' + col + ',' + id];
    };
    Road.prototype.merge = function(other) {
      var e, edge, _ref, _results;
      _ref = other.edges;
      _results = [];
      for (e in _ref) {
        edge = _ref[e];
        _results.push(this.add(edge.row, edge.col, edge.edge, edge.id, edge.hasEnd));
      }
      return _results;
    };
    Road.prototype.toString = function() {
      var address, out;
      out = "Road: (";
      for (address in this.tiles) {
        out += address + "; ";
      }
      return out.slice(0, -2) + "), length: " + this.length + ", numEnds: " + this.numEnds + ", finished: " + this.finished;
    };
    return Road;
  })();
  World = (function() {
    var adjacents, oppositeDirection;
    function World() {
      var i;
      this.tiles = this.generateRandomTileSet();
      this.center = this.minrow = this.maxrow = this.mincol = this.maxcol = this.tiles.length;
      this.roads = [];
      this.cities = [];
      this.farms = [];
      this.board = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.center * 2; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
          _results.push(new Array(this.center * 2));
        }
        return _results;
      }).call(this);
      this.placeTile(this.center, this.center, this.tiles.shift(), []);
    }
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
    oppositeDirection = {
      "north": "south",
      "east": "west",
      "south": "north",
      "west": "east"
    };
    World.prototype.generateRandomTileSet = function() {
      var city, count, east, edge, edgeDefs, edges, grass, hasRoadEnd, hasTwoCities, i, image, isStart, north, regExp, road, roadEdgeCount, south, tile, tileDef, tileDefinitions, tileSets, tiles, west, _ref;
      edgeDefs = {
        'r': 'road',
        'g': 'grass',
        'c': 'city'
      };
      tileDefinitions = ['city1rwe.png   1   start crgr    --  -1-1    1---    --122221', 'city1rse.png   2   reg   crrg    --  -11-    1---    --122111', 'city1rwe.png   1   reg   crgr    --  -1-1    1---    --122221', 'city1rse.png   2   reg   crrg    --  -11-    1---    --122111'];
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
          hasRoadEnd = roadEdgeCount === 1 || roadEdgeCount === 3 || roadEdgeCount === 4;
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
      return tiles = (_ref = []).concat.apply(_ref, tileSets);
    };
    World.prototype.findValidPositions = function(tile) {
      var candidate, candidates, col, i, invalids, offsets, other, row, side, sortedCandidates, turns, valids, _i, _len, _ref, _ref2, _ref3, _ref4;
      candidates = [];
      for (row = _ref = this.minrow - 1, _ref2 = this.maxrow + 1; _ref <= _ref2 ? row <= _ref2 : row >= _ref2; _ref <= _ref2 ? row++ : row--) {
        for (col = _ref3 = this.mincol - 1, _ref4 = this.maxcol + 1; _ref3 <= _ref4 ? col <= _ref4 : col >= _ref4; _ref3 <= _ref4 ? col++ : col--) {
          if (!(this.board[row][col] != null)) {
            for (turns = 0; turns <= 3; turns++) {
              tile.rotate(turns);
              valids = [];
              invalids = 0;
              for (side in adjacents) {
                offsets = adjacents[side];
                other = this.board[row + offsets.row][col + offsets.col];
                if (other != null) {
                  if (tile.connectableTo(other, side)) {
                    valids.push(side);
                  } else {
                    invalids++;
                  }
                }
              }
              if (valids.length > 0 && invalids === 0) {
                candidates.push([row, col, turns, valids]);
              }
              tile.reset();
            }
          }
        }
      }
      sortedCandidates = (function() {
        var _results;
        _results = [];
        for (i = 0; i <= 3; i++) {
          _results.push(new Array());
        }
        return _results;
      })();
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        candidate = candidates[_i];
        sortedCandidates[candidate[2]].push(candidate);
      }
      return sortedCandidates;
    };
    World.prototype.randomlyPlaceTile = function(tile, candidates) {
      var col, i, neighbours, row, turns, _ref, _ref2;
      candidates = (_ref = []).concat.apply(_ref, candidates);
      if (candidates.length > 0) {
        i = Math.round(Math.random() * (candidates.length - 1));
        _ref2 = candidates[i], row = _ref2[0], col = _ref2[1], turns = _ref2[2], neighbours = _ref2[3];
        if (turns > 0) {
          tile.rotate(turns);
        }
        return this.placeTile(row, col, tile, neighbours);
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
    World.prototype.drawCandidates = function(tile, candidates) {
      var actives, attach, candidate, col, neighbours, row, turns;
      $('#candidate').attr('src', 'img/' + tile.image).attr('class', tile.rotationClass);
      attach = __bind(function(cell, row, col, neighbours) {
        return cell.unbind().click(__bind(function() {
          var item, _i, _len;
          for (_i = 0, _len = actives.length; _i < _len; _i++) {
            item = actives[_i];
            item.attr('class', '').unbind();
          }
          this.placeTile(row, col, tile, neighbours);
          this.drawBoard();
          return this.next();
        }, this)).attr('class', 'candidate');
      }, this);
      actives = (function() {
        var _i, _len, _ref, _results;
        _ref = candidates[tile.rotation];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          candidate = _ref[_i];
          row = candidate[0], col = candidate[1], turns = candidate[2], neighbours = candidate[3];
          _results.push(attach($('td[row=' + row + '][col=' + col + ']'), row, col, neighbours));
        }
        return _results;
      })();
      $('#left').unbind().click(__bind(function() {
        var item, _i, _len;
        for (_i = 0, _len = actives.length; _i < _len; _i++) {
          item = actives[_i];
          item.attr('class', '').unbind();
        }
        tile.rotate(-1);
        return this.drawCandidates(tile, candidates);
      }, this));
      return $('#right').unbind().click(__bind(function() {
        var item, _i, _len;
        for (_i = 0, _len = actives.length; _i < _len; _i++) {
          item = actives[_i];
          item.attr('class', '').unbind();
        }
        tile.rotate(1);
        return this.drawCandidates(tile, candidates);
      }, this));
    };
    World.prototype.next = function() {
      var candidates, tile;
      if (this.tiles.length > 0) {
        tile = this.tiles.shift();
        candidates = this.findValidPositions(tile);
        return this.drawCandidates(tile, candidates);
      } else {
        return $('#sideboard').empty();
      }
    };
    World.prototype.placeTile = function(row, col, tile, neighbours) {
      var added, dir, edge, handled, neighbour, offsets, otherCol, otherEdge, otherRow, road, roads, seen, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4;
      if (neighbours.length === 0 && !tile.isStart) {
        throw "Invalid tile placement";
      }
      this.board[row][col] = tile;
      this.maxrow = Math.max(this.maxrow, row);
      this.minrow = Math.min(this.minrow, row);
      this.maxcol = Math.max(this.maxcol, col);
      this.mincol = Math.min(this.mincol, col);
      handled = {
        north: false,
        south: false,
        east: false,
        west: false
      };
      roads = [];
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        dir = neighbours[_i];
        offsets = adjacents[dir];
        otherRow = row + offsets.row;
        otherCol = col + offsets.col;
        neighbour = this.board[otherRow][otherCol];
        edge = tile.edges[dir];
        otherEdge = neighbour.edges[oppositeDirection[dir]];
        added = false;
        if (edge.type === 'road') {
          if (!tile.hasRoadEnd && roads.length > 0) {
            _ref = this.roads;
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              road = _ref[_j];
              if (!added && road.has(otherRow, otherCol, otherEdge.road)) {
                if (roads[0] === road) {
                  road.finished = true;
                  added = true;
                } else {
                  roads[0].merge(road);
                  this.roads.remove(road);
                  added = true;
                }
              }
            }
          } else {
            _ref2 = this.roads;
            for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
              road = _ref2[_k];
              if (!added && road.has(otherRow, otherCol, otherEdge.road)) {
                road.add(row, col, dir, edge.road, tile.hasRoadEnd);
                roads.push(road);
                added = true;
              }
            }
          }
        } else if (edge.type === 'city') {
          console.log('city');
        } else if (edge.type === 'grass') {
          console.log('grass');
        }
        handled[dir] = true;
      }
      for (dir in handled) {
        seen = handled[dir];
        if (!seen) {
          edge = tile.edges[dir];
          added = false;
          if (edge.type === 'road') {
            _ref3 = this.roads;
            for (_l = 0, _len4 = _ref3.length; _l < _len4; _l++) {
              road = _ref3[_l];
              if (!added && road.has(row, col, edge.road)) {
                road.add(row, col, dir, edge.road, tile.hasRoadEnd);
                added = true;
              }
            }
            if (!added) {
              this.roads.push(new Road(row, col, dir, edge.road, tile.hasRoadEnd));
            }
          }
        }
      }
      _ref4 = this.roads;
      for (_m = 0, _len5 = _ref4.length; _m < _len5; _m++) {
        road = _ref4[_m];
        console.log(road.toString());
      }
      return console.log('----------------------------------------');
    };
    return World;
  })();
  world = new World();
  tile = world.tiles.shift();
  positions = world.findValidPositions(tile);
  world.placeTile(6, 5, tile, positions[0][0][3]);
  tile = world.tiles.shift();
  positions = world.findValidPositions(tile);
  tile.rotate(1);
  world.placeTile(6, 7, tile, positions[1][0][3]);
  tile = world.tiles.shift();
  positions = world.findValidPositions(tile);
  tile.rotate(2);
  world.placeTile(7, 6, tile, positions[2][2][3]);
  world.drawBoard();
  world.next();
  $('#left').click();
}).call(this);
