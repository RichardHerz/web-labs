﻿script "Artificial_Zoo"
/*
by Richard K. Herz, www.ReactorLab.net, github.com/RichardHerz

translated from True BASIC (TB) code by R. Herz to LiveCode (LC) by R. Herz

not sure where I first saw this idea
was it in one of Richard Dawkin's books, e.g.,
the selfish gene or the blind watchmaker?

THE MATH NAME IS AN L-system https://en.wikipedia.org/wiki/L-system  "L-systems were
introduced and developed in 1968 by Aristid Lindenmayer, a Hungarian theoretical biologist and
botanist at the University of Utrecht."

ALSO SEE RE: my bracken -  http://en.wikipedia.org/wiki/Barnsley_fern
"The fern code developed by Barnsley is an example of an iterated function system (IFS) to create
a fractal."

ALSO SEE LC code at
 http://livecode.com/the-evolution-of-dragons/
The Evolution of Dragons
by Ian Macphail on April 22, 2015
*/

-- scalars
local maxGen, thisGen, newBud, oldBud, gravSwitch
local x, y, a
local d

-- scalars for drawing
local oMaxLinesToDraw
local lineCounter
local tLineColors

-- arrays
local newGen, gene$

-- 1st dimension of lastGen and newGen arrays >= (number buds in a gene)^(maxGen - 1)
-- array gene$ contains growth instructions

-----------------------

-- gene instructions

-- all genes are stored as string values
-- genes 1-3 are numbers stored as strings,
-- use VAL() to convert to numeric value

-- gene$(1) is increment of angle rotation (degrees, 0 points right, + is CCW)
-- gene$(2) is generation length change factor df for new shoot off major bud B
-- gene$(3) is generation length change factor df for new shoot off minor bud b
-- gene$(4 on) are growth instructions

-- F = make one step forward of length d drawing line
-- J = jump, by making one step forward of length d not drawing line
-- + = rotate by increment of angle rotation specified by gene$(1)
-- - = rotate by NEGATIVE of increment of angle rotation specified by gene$(1)
-- [ = remember this x,y coordinate and direction (angle)
-- ] = return to x,y coordinate and direction (angle) of [ of this [] pair
-- B = major bud location, after following this set of instructions
--     return to each new bud location and repeat entire set of instructions
-- b = minor bud location, after following this set of instructions
--     return to each new bud location and repeat entire set of instructions

-----------------------

on startDrawing pMenuChoice

   set cursor to watch

   clearCanvas

   if pMenuChoice is "TestDNA" then
      put "Edit the gene of TestDNA in the script-only stack Artificial_Zoo.livecodescript" \
      into field "edit dna notice" of stack "Artificial Zoo"
   else
      put empty into field "edit dna notice" of stack "Artificial Zoo"
   end if

   choose pencil tool

   -- this was when I used graphic objects to draw lines
   -- don't need this limit when using pencil or brush on an image
   -- image of size of card used when first pencil or brush dragged
   put 100000 into oMaxLinesToDraw

   -- scalars
   put empty into maxGen
   put empty into thisGen
   put empty into newBud
   put empty into gravSwitch
   put empty into temp$
   put empty into x
   put empty into y
   put empty into a
   put empty into d
   put 0 into lineCounter -- keep, need for drawing

   -- arrays
   put empty into newGen
   put empty into gene$

   -- list colors to use by generation
   put "black,green,blue,orange,red,yellow,magenta,brown,purple" into tLineColors
   -- yellow and green and red hard for me to see
   put "black,blue,orange,black,blue,orange,black,blue,orange,black,blue,orange" into tLineColors

   -- set up the "gene" for this "zoo animal"
   send pMenuChoice to me

   repeat with thisGen = 1 to maxGen

      put "generation:" && thisGen into field "generation display" of stack "Artificial Zoo"

      -- change color of pencil tool line so can see each generation
      if thisGen <= the number of items of tLineColors then
         set the penColor to item thisGen of tLineColors
      else
         set the penColor to "black"
      end if

      -- grow a generation
      grow

   end repeat

   choose browse tool

end startDrawing

-----------------------

on clearCanvas
   put the number of controls of card 1 of this stack into tNum
   -- repeat from highest number control down to smallest
   -- since get renumbered as they are deleted
   repeat with k = tNum down to 1
      if the name of control k contains "image" then
         delete control k
      end if
   end repeat
end clearCanvas

-----------------------

on finishGene temp$

   -- copy gene specifications from temp$ to gene$

   repeat with g = 1 to len(temp$)
      put char g of temp$ into gene$[g+3]
   end repeat

   -- reset d to increase d so 1st line drawn equal to d value set above
   -- since scale factor will be applied 1st time d used

   if budType = 2 then
      put d/gene$[2] into d
   ELSE
      put d/gene$[3] into d
   end if

   put "gene: " into field "gene display" of stack "Artificial Zoo"
   repeat with g = 1 to 3
      put round(gene$[g],3) & comma after field "gene display" of stack "Artificial Zoo"
   end repeat
   repeat with g = 4 to len(temp$)+3
      put gene$[g] after field "gene display" of stack "Artificial Zoo"
   end repeat

end finishGene

-----------------------

on grow

   -- was grow gene$(),lastGen(,),newGen(,),maxGen,thisGen,newBud,gravSwitch

   -- copy newGen(,) to lastGen(,)
   -- newGen is initialized in the commands that specify the genes for this "zoo animal"
   -- newGen is updated below when a bud gene is encountered
   put newGen into lastGen

   put 0 into newBud -- incremented below with each new bud formed
   put 1 into oldBud -- incremented below before end of do-loop

   -- bud type, 1 = "b", 2 = "B"

   repeat while (lastGen[oldBud][5] = 1) or (lastGen[oldBud][5] = 2) -- repeat for all last buds

      -- read next bud from lastGen(,)

      put lastGen[oldBud][1] into tX
      put lastGen[oldBud][2] into tY
      put lastGen[oldBud][3] into tA
      put lastGen[oldBud][4] into tD -- length of parent shoot
      put lastGen[oldBud][5] into budType -- bud type, 1 = "b", 2 = "B"

      -- "gene" values
      -- gene$(1) is increment of angle rotation (degrees, 0 points right, + is CCW)
      -- gene$(2) is generation length change factor for new shoot off major bud B
      -- gene$(3) is generation length change factor for new shoot off minor bud b
      -- gene$(4 on) are growth instructions

      put gene$[1] into tArot -- increment of angle rotation (+ CCW)
      put gene$[2] into majorChange -- length change from one gen to next
      put gene$[3] into minorChange -- length change from one gen to next

      if budType = 2 then
         put tD*majorChange into tD
      ELSE
         put tD*minorChange into tD
      end if

      if gravSwitch = 1 then

         -- get angle off zero so gravity can take effect

         repeat while tA < 0
            put tA + 360 into tA
         end repeat

         repeat until tA is not 90
            -- BASIC FUNCTION: rnd returns value from 0 to less than 1
            -- LC random(upperLimit) returns integer between 1 and upperLimit
            put (random(1001)-1)/1000 into rnd
            put tA + 1*(1 - 2*rnd) into tA
         end repeat

         -- add effect of gravity, a = 90 is straight up
         put 4 into factor
         if tA > 90 and tA < (270 - factor) then
            put tA + factor into tA
         else if tA > (270 + factor) and tA < 360 then
            put tA - factor into tA
         else if tA > 0 and tA < 90 then
            put tA  - factor into tA
         end if

      end if -- end of "if gravSwitch = 1 then"

      -- initialize bracket counters
      put 0 into right_bracket
      put 0 into left_bracket

      -- initialize OLD arrays
      -- these local arrays save coordinates
      --      put empty into xOLD
      --      put empty into yOLD
      --      put empty into aOLD

      put 4 into ng

      repeat while gene$[ng] is not empty

         switch gene$[ng]
            case "F"
               -- step and draw line
               put Ffunction(tX, tY, tA, tD) into tReturnedValue
               put item 1 of tReturnedValue into tX
               put item 2 of tReturnedValue into tY
               break
            case "J"
               -- jump with no line
               put Jfunction(tX, tY, tA, tD) into tReturnedValue
               put item 1 of tReturnedValue into tX
               put item 2 of tReturnedValue into tY
               break
            case "["
               -- remember this x,y coordinate and direction (angle)
               put left_bracket + 1 into left_bracket
               put tX into xOLD[left_bracket]
               put tY into yOLD[left_bracket]
               put tA into aOLD[left_bracket]
               break
            case "]"
               -- reset x,y coordinate and direction to last in this pair
               put right_bracket + 1 into right_bracket
               put left_bracket - right_bracket + 1 into theOne
               put xOLD[theOne] into tX
               put yOLD[theOne] into tY
               put aOLD[theOne] into tA
               if right_bracket = left_bracket then
                  -- matched all pairs so far, reset counters
                  put 0 into right_bracket
                  put 0 into left_bracket
               end if
               break
            case "+"
               put tA + tArot into tA
               break
            case "-"
               put tA - tArot into tA
               break
            case "B"
            case  "b"
               if thisGen < maxGen then      -- save memory if ending growth at maxGen
                  -- record this x,y coordinate as a new bud
                  put newBud + 1 into newBud
                  put tX into newGen[newBud][1]
                  put tY into newGen[newBud][2]
                  put tA into newGen[newBud][3]
                  put tD into newGen[newBud][4]
                  set the caseSensitive to true -- need to distinguish B from b
                  if gene$[ng] = "B" then
                     put 2 into newGen[newBud][5] -- a new major bud
                  else
                     put 1 into newGen[newBud][5] -- a new minor bud
                  end if
               end if
               break
            default
               -- BAD GENE
         end switch
         put ng+1 into ng
      end repeat

      put oldBud + 1 into oldBud -- increment so read next old bud

   end repeat

end grow

-----------------------

function Ffunction pX, pY, pA, pD

   -- was Fsub x,y,a,d

   -- draw a line of length d at angle a

   -- angles specified in degrees but LC functions need radians
   put pA*pi/180 into tRadians
   put pD*cos(tRadians) into newDX
   put pD*sin(tRadians) into newDY

   put round(newDX) into newDX
   put round(newDY) into newDY

   put pX + newDX into tX2
   put pY - newDY into tY2

   -- add new line segment between x,y and x2,y2
   put pX into item 1 of line 1 of tPts
   put pY into item 2 of line 1 of tPts
   put tX2 into item 1 of line 2 of tPts
   put tY2 into item 2 of line 2 of tPts

   -- draw line with pencil tool
   drag from pX,pY to tX2,tY2

   put tX2 into item 1 of tReturnValue
   put tY2 into item 2 of tReturnValue

   return tReturnValue

end Ffunction

-----------------------

function Jfunction pX, pY, pA, pD

   -- was Jsub x,y,a,d

   -- jump length d at angle a

   -- angles specified in degrees but LC functions need radians
   put pA*pi/180 into tRadians
   put pD*cos(tRadians) into newDX
   put pD*sin(tRadians) into newDY

   put round(newDX) into newDX
   put round(newDY) into newDY

   put pX + newDX into tX2
   put pY - newDY into tY2 -- sign was + in TB

   put tX2 into item 1 of tReturnValue
   put tY2 into item 2 of tReturnValue

   return tReturnValue

end Jfunction

-----------------------

on TestDNA

   put "45" into gene$[1] -- was "45" in TB
   put "0.8" into gene$[2] -- was "0.8" in TB
   put "0.4" into gene$[3] -- was "0.4" in TB
   -- temp$ will automatically be translated below into genes 4 on
   put "F+F[-F]+FB" into temp$

   -- specify initial bud

   put 100 into x -- horizontal coordinate of bud -- was 500 in TB
   put 600 into y -- vertical coordinate of bud -- was 100 in TB
   put 0 into a -- angle bud points -- was 90 in TB
   put 20 into d -- length of first shoot -- was 40 in TB
   put 2 into budType -- major (B) = 2, minor (b) = 1

   -- specify number of "generations" to draw

   put 3 into maxGen

   put 0 into gravSwitch -- off = 0, on = 1

finishGene temp$

   -- copy initial bud specifications to newGen(,) array

   put 1 into newBud
   put x into newGen[newBud][1]
   put y into newGen[newBud][2]
   put a into newGen[newBud][3] -- angle to head
   put d into newGen[newBud][4] -- length of parent shoot
   put budType into newGen[newBud][5] -- bud type, 1 = "b", 2 = "B"

end TestDNA
-----------------------

on Bracken

   -- was bracken gene$(),newGen(,),maxGen,newBud,gravSwitch

  put "45" into gene$[1] -- was "45" in TB
  put "0.8" into gene$[2] -- was "0.8" in TB
  put "0.4" into gene$[3] -- was "0.4" in TB
  -- temp$ will automatically be translated below into genes 4 on
  put "FF[+Fb]F[-Fb]FB" into temp$

  -- specify initial bud

  put 50 into x -- horizontal coordinate of bud -- was 500 in TB
  put 600 into y -- vertical coordinate of bud -- was 100 in TB
  put 45 into a -- angle bud points -- was 90 in TB
  put 30 into d -- length of first shoot -- was 40 in TB
  put 2 into budType -- major (B) = 2, minor (b) = 1

  -- specify number of "generations" to draw

  put 4 into maxGen -- was 9 in TB

  put 1 into gravSwitch -- off = 0, on = 1

  finishGene temp$
  -- was   finishGene temp$,d,gene$()

  -- copy initial bud specifications to newGen(,) array

  put 1 into newBud
  put x into newGen[newBud][1]
  put y into newGen[newBud][2]
  put a into newGen[newBud][3] -- angle to head
  put d into newGen[newBud][4] -- length of parent shoot
  put budType into newGen[newBud][5] -- bud type, 1 = "b", 2 = "B"

end Bracken

-----------------------

on Islands

   -- was islands gene$(),newGen(,),maxGen,newBud,gravSwitch

   -- this is different from others because it has more
   --  than one initial bud

   -- specify island and lakes genes
   put "90" into gene$[1]
   put "0.15" into gene$[2]
   put "1" into gene$[3]
   put "BF+J-BFBF+BF+BFBF+BFJ+BFBF-J+BFBF-BF-BFBF-BFJ-BFBFBF" into temp$

   -- MULTIPLE INITIAL BUDS, SET x,y,a SEPARATELY BELOW

   put 40 into d0 -- was 80 in TB
   put 2 into budType -- major (B) = 2, minor (b) = 1

   -- set number of "generations" to draw
   -- takes a long time to generate with 4 initial buds...
   put 2 into maxGen -- was 2 in TB

   repeat with g = 1 to len(temp$)
      put char g of temp$ into gene$[g+3]
   end repeat

   if budType = 2 then
      put d0/gene$[2] into d
   ELSE
      put d0/gene$[3] into d
   end if

   -- DO THIS HERE RATHER THAN FINISH GENE BECAUSE OF MULTIPLE BUDS
   -- AND FINISH GENE NOT CALLED
   put "gene: " into field "gene display" of stack "Artificial Zoo"
   repeat with g = 1 to 3
      put round(gene$[g],3) & comma after field "gene display" of stack "Artificial Zoo"
   end repeat
   repeat with g = 4 to len(temp$)+3
      put gene$[g] after field "gene display" of stack "Artificial Zoo"
   end repeat

   put round(d) into d

   put 500 into x0 -- was 700 in TB
   put 500 into y0 -- was 250 in TB

   put x0 into x
   put y0 into y

   put 1 into newBud
   put x0 into newGen[newBud][1]
   put y0 into newGen[newBud][2]
   put 90 into newGen[newBud][3]
   put d into newGen[newBud][4]
   put budType into newGen[newBud][5]

   put 2 into newBud
   put x0 into newGen[newBud][1]
   put y0 - 6*d0 into newGen[newBud][2]
   put 180 into newGen[newBud][3]
   put d into newGen[newBud][4]
   put budType into newGen[newBud][5]

   put 3 into newBud
   put x0 - 6*d0 into newGen[newBud][1]
   put y0 - 6*d0 into newGen[newBud][2]
   put 270 into newGen[newBud][3]
   put d into newGen[newBud][4]
   put budType into newGen[newBud][5]

   put 4 into newBud
   put x0 - 6*d0 into newGen[newBud][1]
   put y0 into newGen[newBud][2]
   put 0 into newGen[newBud][3]
   put d into newGen[newBud][4]
   put budType into newGen[newBud][5]

end Islands

-----------------------

on Koch6

   -- was koch6 gene$(),newGen(,),maxGen,newBud,gravSwitch

   -- specify genes FOR KOCH CURVE
   put "60" into gene$[1]
   put "0.333333333" into gene$[2]
   put "0.333333333" into gene$[3]

   put "BF+BF--BF+BF--BF+BF--BF+BF--BF+BF--BF+BF" into temp$

   -- specify starting bud
   put 225 into x -- was 225 in TB
   put 400 into y -- was 250 in TB
   put 60 into a -- was 60 in TB
   put 100 into d -- was 200 in TB
   put 2 into budType -- major (B) = 2, minor (b) = 1

   -- Set number of "generations" to draw
   put 3 into maxGen -- was 4 in TB

   put 0 into gravSwitch -- off = 0, on = 1

   finishGene temp$
   -- was finishGene temp$,d,gene$()

   put 1 into newBud
   put x into newGen[newBud][1]
   put y into newGen[newBud][2]
   put a into newGen[newBud][3] -- angle to head
   put d into newGen[newBud][4]-- length of parent shoot
   put budType into newGen[newBud][5] -- bud type, 1 = "b", 2 = "B"

end Koch6

-----------------------

on Koch8

   -- was koch8  gene$(),newGen(,),maxGen,newBud,gravSwitch

   -- specify genes FOR KOCH CURVE
   put "45" into gene$[1]
   put 1/(2 + 2^0.5) into n

   -- BASIC FUNCTION str$() cast numeric to string
   -- don't need in LC
   --   put str$[n] into gene$[2]
   --   put str$[n] into gene$[3]

   put n into gene$[2]
   put n into gene$[3]

   -- xxx note lots of repetition in this gene, anyway to shorten this? xxx
   put "BF+BF--BF+BF--BF+BF--BF+BF--BF+BF--BF+BF--BF+BF--BF+BF" into temp$

   -- xxx this has equivalent geometry but "fills in" in a different progression
   -- xxx since second generation on starting side is detailed whereas
   -- xxx first lines along the top are only drawn in the second generation
   --    -- LET gene$(2) = "1"
   --    -- LET temp$ = "[J+J--J+J--B]bF+bF--bF+bF"
   --    put 1 into gene$[2]
   --    put "[J+J--J+J--B]bF+bF--bF+bF" into temp$

   -- should work to have 1st generation having 4 initial buds (diff. x,y,a),
   -- each at a different corner of the cube and pointing different directions,
   -- then the genes are only:  LET temp$ = "BF+BF--BF+BF"
   --    put "BF+BF--BF+BF" into temp$

   -- specify starting bud
   put 225 into x -- was 225 in TB
   put 500 into y -- was 250 in TB
   put 90 into a -- was 90 in TB
   put 80 into d -- was 150 in TB
   put 2 into budType -- 1 = minor bud, 2 = major bud

   -- set number of "generations" to draw
   put 3 into maxGen -- was 4 in TB

   put 0 into gravSwitch -- off = 0, on = 1

   finishGene temp$
   -- was finishGene temp$,d,gene$()

   put 1 into newBud
   put x into newGen[newBud][1]
   put y into newGen[newBud][2]
   put a into newGen[newBud][3] -- angle to head
   put d into newGen[newBud][4]-- length of parent shoot
   put budType into newGen[newBud][5] -- bud type, 1 = "b", 2 = "B"

end Koch8

-----------------------

on Sierpinski

   -- was serpinksi gene$()

   -- specify genes
   put "120" into gene$[1]
   put "0.5" into gene$[2]
   put "1" into gene$[3]
   put "BFBF-FF-F[-B]F" into temp$

   -- specify initial bud
   put 600 into x -- horizontal coordinate of bud -- was 800 in TB
   put 500 into y -- vertical coordinate of bud -- was 150 in TB
   put 180 into a
   put 400 into d -- was 350 in TB
   put 2 into budType

   -- set number of "generations" to draw
   put 6 into maxGen -- was 7 in TB

   put 0  into gravSwitch -- off = 0, on = 1

   finishGene temp$
   -- was finishGene temp$,d,gene$() in TB

   put 1 into newBud
   put x into newGen[newBud][1]
   put y into newGen[newBud][2]
   put a into newGen[newBud][3] -- angle to head
   put d into newGen[newBud][4] -- length of parent shoot
   put budType into newGen[newBud][5] -- bud type, 1 = "b", 2 = "B"

end Sierpinski

-----------------------

on Dragon

   -- was dragon gene$(),newGen(,),maxGen,newBud,gravSwitch

  -- specify Dragon genes
  put "45" into gene$[1]
  put "0.7071067812" into gene$[2] -- = 1/2^0.5
  put "1" into gene$[3]
  put "-BF++F----B" into temp$

  -- specify initial bud
  put 200 into x -- was 250 in TB
  put 300 into y -- was 600 in TB
  put 0 into a -- was 0 in TB
  put 300 into d -- was 400 in TB
  put 2 into budType -- major (B) = 2, minor (b) = 1

  -- set number of "generations" to draw
  put 10 into maxGen -- was 14 in TB

  put 0 into gravSwitch -- off = 0, on = 1

  finishGene temp$
  -- was finishGene temp$,d,gene$()

  put 1 into newBud
  put x into newGen[newBud][1]
  put y into newGen[newBud][2]
  put a into newGen[newBud][3] -- angle to head
  put d into newGen[newBud][4] -- length of parent shoot
  put budType into newGen[newBud][5] -- bud type, 1 = "b", 2 = "B"

end Dragon
