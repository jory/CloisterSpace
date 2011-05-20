class Edge
  constructor: (@edge, @road, @city, @grass, @grassEdges) ->
    @string = 'edge: ' + @edge + ', road: ' + @road + ', city: ' + @city +
              ', grass: ' + @grass + ', grassEdges: ' + @grassEdges


class Tile
  constructor: (@image, north, east, south, west, @hasTwoCities, @hasRoadEnd, @isStart) ->
    @edges =
      north: north
      east:  east
      south: south
      west:  west

    @rotation = 0
    @rotationClass = 'r0'


  rotate: (turns) ->
    if turns not in [-3..3]
      throw 'Invalid Rotation'

    if turns != 0
      switch turns
        when -1 then turns = 3
        when -2 then turns = 2
        when -3 then turns = 1

      @rotation += turns
      @rotation -= 4 if @rotation > 3

      @rotationClass = 'r' + @rotation

      for i in [1..turns]
        tmp = @edges.north
        @edges.north = @edges.west
        @edges.west  = @edges.south
        @edges.south = @edges.east
        @edges.east  = tmp


  reset: ->
    @rotate(4 - @rotation) if @rotation > 0


  connectableTo: (other, from) ->
    oppositeDirection =
      "north": "south"
      "east" : "west"
      "south": "north"
      "west" : "east"

    to = oppositeDirection[from]

    @edges[from].edge is other.edges[to].edge


class World
  constructor: ->
    @tiles = @generateRandomTileSet()

    @center = @minrow = @maxrow = @mincol = @maxcol = @tiles.length

    @board = (new Array(@center * 2) for i in [1..@center * 2])
    @placeTile(@center, @center, @tiles.shift())


  generateRandomTileSet: ->

    # order of edge specs is NESW
    #
    # More edge details:
    # RoadMap (order NESW),
    # CityMap (order NESW),
    # GrassMap (clockwise-order starting from top-edge on the left side.
    #           Or in compass notation: NNW,NNE,ENE,ESE,SSE,SSW,WSW,WNW)

    edgeDefs =
      'r': 'road'
      'g': 'grass'
      'c': 'city'

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
      road  = tile[5].split('')
      city  = tile[6].split('')
      grass = tile[7].split('')

      roadEdgeCount = (edge for edge in edges when edge is 'r').length
      hasRoadEnd = roadEdgeCount is (1 or 3 or 4)

      north = new Edge(edgeDefs[edges[0]], road[0], city[0], grass[0], grass[1])
      east  = new Edge(edgeDefs[edges[1]], road[1], city[1], grass[2], grass[3])
      south = new Edge(edgeDefs[edges[2]], road[2], city[2], grass[4], grass[5])
      west  = new Edge(edgeDefs[edges[3]], road[3], city[3], grass[6], grass[7])

      for i in [1..count]
        new Tile(image, north, east, south, west, hasTwoCities, hasRoadEnd, isStart)

    tiles = [].concat tileSets...

    # This operation is ugly, but necessary
    [tiles[0]].concat _(tiles[1..tiles.length]).sortBy(-> Math.random())


  findValidPositions: (tile) ->
    adjacents =
      north:
        row:-1
        col: 0
      east:
        row: 0
        col: 1
      south:
        row: 1
        col: 0
      west:
        row: 0
        col:-1

    candidates = []

    for row in [@minrow - 1..@maxrow + 1]
      for col in [@mincol - 1..@maxcol + 1]
        if not @board[row][col]?
          for turns in [0..3]

            tile.rotate(turns)

            valids = 0
            invalids = 0

            for side, offsets of adjacents
              other = @board[row + offsets.row][col + offsets.col]
              if other?
                if tile.connectableTo(other, side)
                  valids++
                else
                  invalids++

            if valids > 0 and invalids is 0
              candidates.push([row, col, turns])

            tile.reset()

    sortedCandidates = (new Array() for i in [0..3])

    for candidate in candidates
      sortedCandidates[candidate[2]].push(candidate)

    sortedCandidates


  placeTile: (row, col, tile) ->
    @board[row][col] = tile

    @maxrow = Math.max(@maxrow, row)
    @minrow = Math.min(@minrow, row)
    @maxcol = Math.max(@maxcol, col)
    @mincol = Math.min(@mincol, col)


  randomlyPlaceTile: (tile, candidates) ->
    candidates = [].concat candidates...

    if candidates.length > 0
      i = Math.round(Math.random() * (candidates.length - 1))
      [row, col, turns] = candidates[i]

      tile.rotate(turns) if turns > 0

      @placeTile(row, col, tile)


  drawBoard: ->
    table = $("<table><tbody></tbody></table>")
    tbody = table.find("tbody")

    for row in [@minrow - 1..@maxrow + 1]
      tr = $("<tr></tr>")
      for col in [@mincol - 1..@maxcol + 1]
        td = $("<td row='" + row + "' col='" + col + "'></td>")
        tile = @board[row][col]
        if tile?
          td = $("<td row='" + row + "' col='" + col + "'>" +
                 "<img src='img/" + tile.image +
                 "' class='" + tile.rotationClass + "'/></td>")
        tr.append(td)
      tbody.append(tr)
    $("#board").empty().append(table)


  next: ->
    if @tiles.length > 0
      tile = @tiles.shift()
      candidates = @findValidPositions(tile)
      @drawCandidates(tile, candidates)


  drawCandidates: (tile, candidates) ->
    $('#candidate').attr('src', 'img/' + tile.image).attr('class', tile.rotationClass)

    attach = (cell, row, col) =>
      cell.unbind().click(=>

        for item in actives
          item.attr('class', '').unbind()

        @placeTile(row, col, tile)
        @drawBoard()
        @next()
      ).attr('class', 'candidate')

    actives = for candidate in candidates[tile.rotation]
      [row, col] = candidate
      attach($('td[row=' + row + '][col=' + col + ']'), row, col)

    $('#left').unbind().click(=>
      for item in actives
        item.attr('class', '').unbind()

      tile.rotate(-1)
      @drawCandidates(tile, candidates)
    )

    $('#right').unbind().click(=>
      for item in actives
        item.attr('class', '').unbind()

      tile.rotate(1)
      @drawCandidates(tile, candidates)
    )

world = new World()
world.drawBoard()
world.next()
