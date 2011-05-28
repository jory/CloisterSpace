Array::remove = (e) -> @[t..t] = [] if (t = @.indexOf(e)) > -1

oppositeDirection =
  "north": "south"
  "east" : "west"
  "south": "north"
  "west" : "east"

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

class Edge
  constructor: (@type, @road, @city, @grassA, @grassB) ->
    @string = "type: #{@type}, road: #{@road}, city: #{@city}, grassA: #{@grassA}, grassB: #{@grassB}"


class Tile
  constructor: (@image, north, east, south, west, @hasTwoCities, @hasRoadEnd, @hasPennant, @isStart) ->
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

    if turns isnt 0
      switch turns
        when -1 then turns = 3
        when -2 then turns = 2
        when -3 then turns = 1

      @rotation += turns
      @rotation -= 4 if @rotation > 3

      @rotationClass = "r#{@rotation}"

      for i in [1..turns]
        tmp = @edges.north
        @edges.north = @edges.west
        @edges.west  = @edges.south
        @edges.south = @edges.east
        @edges.east  = tmp

  reset: ->
    @rotate(4 - @rotation) if @rotation > 0

  connectableTo: (other, from) ->
    to = oppositeDirection[from]
    @edges[from].type is other.edges[to].type


class Road
  constructor: (row, col, edge, id, hasEnd) ->
    address = "#{row},#{col}"

    @tiles = {}
    @tiles[address] = true

    @ids = {}
    @ids[address + ",#{id}"] = true

    @edges = {}
    @edges[address + ",#{edge}"] =
      row: row
      col: col
      edge: edge
      id: id
      hasEnd: hasEnd

    @length = 1

    @numEnds = if hasEnd then 1 else 0

    @finished = false

  add: (row, col, edge, id, hasEnd) ->
    address = "#{row},#{col}"

    if not @tiles[address]
      @length += 1
      @tiles[address] = true

    @ids[address + ",#{id}"] = true

    @edges[address + ",#{edge}"] =
      row: row
      col: col
      edge: edge
      id: id
      hasEnd: hasEnd

    if hasEnd
      @numEnds += 1
      if @numEnds is 2
        @finished = true

  has: (row, col, id) ->
    @ids["#{row},#{col},#{id}"]

  merge: (other) ->
    for e, edge of other.edges
      @add(edge.row, edge.col, edge.edge, edge.id, edge.hasEnd)

  toString: ->
    out = "Road: ("
    for address of @tiles
      out += "#{address}; "
    out.slice(0, -2) + "), length: #{@length}, finished: #{@finished}, numEnds: #{@numEnds}"


class City
  constructor: (row, col, edge, id, hasPennant) ->
    address = "#{row},#{col}"

    @tiles = {}
    @tiles[address] = true

    @ids = {}
    @ids[address + ",#{id}"] = true

    @edges = {}
    @edges[address + ",#{edge}"] =
      row: row
      col: col
      edge: edge
      id: id

    @openEdges = []
    @openEdges.push(address + ",#{edge}")

    @length = 1

    @numPennants = if hasPennant then 1 else 0

    @finished = false

  add: (row, col, edge, id, hasPennant) ->
    address = "#{row},#{col}"

    if not @tiles[address]
      @tiles[address] = true
      @length += 1
      if hasPennant
        @numPennants += 1

    @ids[address + ",#{id}"] = true

    @edges[address + ",#{edge}"] =
      row: row
      col: col
      edge: edge
      id: id

    offset = adjacents[edge]
    otherRow = row + offset.row
    otherCol = col + offset.col
    otherAddress = "#{otherRow},#{otherCol},#{oppositeDirection[edge]}"

    if otherAddress in @openEdges
      @openEdges.remove(otherAddress)
    else
      @openEdges.push(address + ",#{edge}")

    if @openEdges.length is 0
      @finished = true
    else
      @finished = false

  has: (row, col, id) ->
    @ids["#{row},#{col},#{id}"]

  merge: (other) ->
    for e, edge of other.edges
      @add(edge.row, edge.col, edge.edge, edge.id, false)
    @numPennants += other.numPennants

  toString: ->
    out = "City: ("
    for address of @tiles
      out += "#{address}; "
    out.slice(0, -2) + "), length: #{@length}, finished: #{@finished}, numPennants: #{@numPennants}"


class World
  constructor: ->
    @tiles = @generateRandomTileSet()

    @center = @minrow = @maxrow = @mincol = @maxcol = @tiles.length
    @maxSize = @center * 2

    @roads = []
    @cities = []
    @farms = []

    @board = (new Array(@maxSize) for i in [1..@maxSize])
    @placeTile(@center, @center, @tiles.shift(), [])

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
        # FOOFOOFOO
        ##########################################
        'city1rwe.png   1   start crgr    --  -1-1    1---    --122221',
        'city1rwe.png   3   reg   crgr    --  -1-1    1---    --122221',
        'city4q.png     1   reg   cccc    --  ----    1111    --------',
        'road4.png      1   reg   rrrr    --  1234    ----    12233441',
        'city3.png      3   reg   ccgc    --  ----    11-1    ----11--',
        'city3q.png     1   reg   ccgc    --  ----    11-1    ----11--',
        'city3r.png     1   reg   ccrc    --  --1-    11-1    ----12--',
        'city3qr.png    2   reg   ccrc    --  --1-    11-1    ----12--',
        'road3.png      4   reg   grrr    --  -123    ----    11122331',
        'city2we.png    1   reg   gcgc    --  ----    -1-1    11--22--',
        'city2weq.png   2   reg   gcgc    --  ----    -1-1    11--22--',
        'road2ns.png    8   reg   rgrg    --  1-1-    ----    12222111',
        'city2nw.png    3   reg   cggc    --  ----    1--1    --1111--',
        'city2nwq.png   2   reg   cggc    --  ----    1--1    --1111--',
        'city2nwr.png   3   reg   crrc    --  -11-    1--1    --1221--',
        'city2nwqr.png  2   reg   crrc    --  -11-    1--1    --1221--',
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
      hasRoadEnd = (roadEdgeCount is 1 or roadEdgeCount is 3 or roadEdgeCount is 4)
      hasPennant = 'q' in image

      north = new Edge(edgeDefs[edges[0]], road[0], city[0], grass[0], grass[1])
      east  = new Edge(edgeDefs[edges[1]], road[1], city[1], grass[2], grass[3])
      south = new Edge(edgeDefs[edges[2]], road[2], city[2], grass[4], grass[5])
      west  = new Edge(edgeDefs[edges[3]], road[3], city[3], grass[6], grass[7])

      for i in [1..count]
        new Tile(image, north, east, south, west, hasTwoCities, hasRoadEnd, hasPennant, isStart)

    tiles = [].concat tileSets...

    # This operation is ugly, but necessary
    [tiles[0]].concat _(tiles[1..tiles.length]).sortBy(-> Math.random())

  findValidPositions: (tile) ->
    candidates = []

    for row in [@minrow - 1..@maxrow + 1]
      for col in [@mincol - 1..@maxcol + 1]
        if not @board[row][col]?
          for turns in [0..3]

            tile.rotate(turns)

            valids = []
            invalids = 0

            for side, offsets of adjacents
              otherRow = row + offsets.row
              otherCol = col + offsets.col

              if 0 <= otherRow < @maxSize and 0 <= otherCol < @maxSize
                other = @board[otherRow][otherCol]
                if other?
                  if tile.connectableTo(other, side)
                    valids.push(side)
                  else
                    invalids++

            if valids.length > 0 and invalids is 0
              candidates.push([row, col, turns, valids])

            tile.reset()

    sortedCandidates = (new Array() for i in [0..3])

    for candidate in candidates
      sortedCandidates[candidate[2]].push(candidate)

    sortedCandidates

  randomlyPlaceTile: (tile, candidates) ->
    candidates = [].concat candidates...

    if candidates.length > 0
      i = Math.round(Math.random() * (candidates.length - 1))
      [row, col, turns, neighbours] = candidates[i]

      tile.rotate(turns) if turns > 0

      @placeTile(row, col, tile, neighbours)

  drawBoard: ->
    table = $("<table><tbody></tbody></table>")
    tbody = table.find("tbody")

    for row in [@minrow - 1..@maxrow + 1]
      tr = $("<tr></tr>")
      for col in [@mincol - 1..@maxcol + 1]
        if 0 <= row < @maxSize and 0 <= col < @maxSize
          td = $("<td row='#{row}' col='#{col}'></td>")
          tile = @board[row][col]
          if tile?
            td = $("<td row='#{row}' col='#{col}'>" +
                   "<img src='img/#{tile.image}' class='#{tile.rotationClass}'/></td>")
            # TODO: Remove this!
            if tile.isStart
              td.attr('class', 'debug')
          tr.append(td)
      tbody.append(tr)
    $("#board").empty().append(table)

  drawCandidates: (tile, candidates) ->
    $('#candidate').attr('src', "img/#{tile.image}").attr('class', tile.rotationClass)

    attach = (cell, row, col, neighbours) =>
      cell.unbind().click(=>

        for item in actives
          item.attr('class', '').unbind()

        $('#left').unbind().attr('disabled', 'disabled')
        $('#right').unbind().attr('disabled', 'disabled')

        @placeTile(row, col, tile, neighbours)
        @tiles.shift()
        @drawBoard()
        @next()
      ).attr('class', 'candidate')

    actives = for candidate in candidates[tile.rotation]
      [row, col, turns, neighbours] = candidate
      attach($("td[row=#{row}][col=#{col}]"), row, col, neighbours)

    $('#left').unbind().click(=>
      for item in actives
        item.attr('class', '').unbind()

      $('#left').unbind().attr('disabled', 'disabled')
      $('#right').unbind().attr('disabled', 'disabled')

      tile.rotate(-1)
      @drawCandidates(tile, candidates)
    ).attr('disabled', '')

    $('#right').unbind().click(=>
      for item in actives
        item.attr('class', '').unbind()

      $('#left').unbind().attr('disabled', 'disabled')
      $('#right').unbind().attr('disabled', 'disabled')

      tile.rotate(1)
      @drawCandidates(tile, candidates)
    ).attr('disabled', '')

  next: ->
    if @tiles.length > 0
      tile = @tiles[0]
      candidates = @findValidPositions(tile)
      @drawCandidates(tile, candidates)
    else
      $('#candidate').attr('style', 'visibility: hidden')
      $('#left').unbind().attr('disabled', 'disabled')
      $('#right').unbind().attr('disabled', 'disabled')

  placeTile: (row, col, tile, neighbours) ->
    if neighbours.length is 0 and not tile.isStart
      throw "Invalid tile placement"

    @board[row][col] = tile

    @maxrow = Math.max(@maxrow, row)
    @minrow = Math.min(@minrow, row)
    @maxcol = Math.max(@maxcol, col)
    @mincol = Math.min(@mincol, col)

    # Connect the features of the current tile to the world-level features.
    #
    # Keeping track of roads, cities and farms:
    #
    #  - every city edge must be connected to another city edge. If any
    #    city edge is unconnected (i.e. singular), the city can't be complete
    #
    #  - roads must have two ends (or make a fully closed loop)
    #
    #  - farms... are complicated
    #    - have to handle the grass type edge, but also have to handle the grass on each individual edge.

    handled =
      north: false
      south: false
      east:  false
      west:  false

    roads = []
    cities = []

    for dir in neighbours
      offsets = adjacents[dir]
      otherRow = row + offsets.row
      otherCol = col + offsets.col
      neighbour = @board[otherRow][otherCol]

      edge = tile.edges[dir]
      otherEdge = neighbour.edges[oppositeDirection[dir]]

      added = false

      if edge.type is 'road'
        if not tile.hasRoadEnd and roads.length > 0
          for road in @roads
            if not added and road.has(otherRow, otherCol, otherEdge.road)
              if roads[0] is road
                # Closing a loop
                road.finished = true
                added = true
              else
                # Merging two roads
                roads[0].merge(road)
                @roads.remove(road)
                added = true
        else
          for road in @roads
            if not added and road.has(otherRow, otherCol, otherEdge.road)
              road.add(row, col, dir, edge.road, tile.hasRoadEnd)
              roads.push(road)
              added = true

      else if edge.type is 'city'
        if not tile.hasTwoCities and cities.length > 0
          for city in @cities
            if not added and city.has(otherRow, otherCol, otherEdge.city)
              cities[0].add(row, col, dir, edge.city, tile.hasPennant)
              cities[0].merge(city)
              @cities.remove(city)
              added = true
        else
          for city in @cities
            if not added and city.has(otherRow, otherCol, otherEdge.city)
              city.add(row, col, dir, edge.city, tile.hasPennant)
              cities.push(city)
              added = true

      else if edge.type is 'grass'
        # TODO: Handle this
        console.log('grass')

      handled[dir] = true


    for dir, seen of handled
      if not seen
        edge = tile.edges[dir]

        # either attach my features to existing ones on the current tile,
        # or create new features.
        added = false

        if edge.type is 'road'
          for road in @roads
            if not added and road.has(row, col, edge.road)
              road.add(row, col, dir, edge.road, tile.hasRoadEnd)
              added = true

          if not added
              @roads.push(new Road(row, col, dir, edge.road, tile.hasRoadEnd))

        else if edge.type is 'city'
          for city in @cities
            if not added and city.has(row, col, edge.city)
              city.add(row, col, dir, edge.city, tile.hasPennant)
              added = true

          if not added
            @cities.push(new City(row, col, dir, edge.city, tile.hasPennant))


world = new World()
world.drawBoard()
world.next()

print_features = (all) ->
  console.log('------------------------------------------')

  for city in world.cities
    if all or city.finished
      console.log(city.toString())

  for road in world.roads
    if all or road.finished
      console.log(road.toString())

  for farm in world.farms
    if all
      console.log(farm.toString())


$('#features_all').click(->
  print_features(true)
)

$('#features_completed').click(->
  print_features(false)
)

$('#features_farms').click(->
  for farm in world.farms
    console.log(farm.toString())
)

$('#go').click(->
  for tile in world.tiles
    world.randomlyPlaceTile(tile, world.findValidPositions(tile))

  $('#candidate').attr('style', 'visibility: hidden')
  $('#left').unbind().attr('disabled', 'disabled')
  $('#right').unbind().attr('disabled', 'disabled')

  $('#go').unbind().attr('disabled', 'disabled')

  $('.candidate').unbind().attr('class', '')

  world.drawBoard()
).attr('disabled', '')

$('#go').click()
