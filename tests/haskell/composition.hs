type Number = Int
type NumberOp = Int -> Int

tres :: Int
tres = 3

doble :: Int -> Int
doble num = num * 2

cuadruple :: Int -> Int
cuadruple x = doble . doble $ x

multi :: Int -> Int -> Int
multi x y = x * y

cuatro :: Int
cuatro = multi 2 2