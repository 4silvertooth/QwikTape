export const intro = 

`Welcome,

This is a QwikTape document,
Do calculations easily, neatly with auto indent 
and formatting,

      ${300.00.toLocaleString()} my last balance
-       ${5.22.toLocaleString()} food 
════════════
      ${294.78.toLocaleString()} this is my new balance


income = 2200 assign values to a variable name

      ${294.78.toLocaleString()} 
+     income
════════════
     ${2494.78.toLocaleString()} = balance assign results to variable

     balance     using varialbe from above
-      ${25.00.toLocaleString()}% ⥱ ${623.70.toLocaleString()} damn high taxes
════════════
     ${1871.09.toLocaleString()} 
-      ${50.00.toLocaleString()} continue calculations
-      ${20.00.toLocaleString()} 
════════════
     ${1801.09.toLocaleString()} 

Try changing the value of variable 'income' above,
all following values will recalculate.

pi =  3.141592653
radius = 5

Assign expression to a variable, it will follow 
rules of operator precedence,
area = pi × radius ^ 2 

        area hover cursor over variable name
+     ${600.00.toLocaleString()}
════════════
      ${678.54.toLocaleString()}
÷     ${0.00.toLocaleString()} hover cursor over errors
-    -${100.00.toLocaleString()} subtract negetive numbers
════════════
      ${778.54.toLocaleString()} erroneous operations skipped

Document is auto saved. Use the bookmark menu on top left to find all
the documents added.

Start by creating a new document, using the [+] button on the title bar. 


`

export const tests = 

`Some tests,

test1 = 0.1 + 0.2
test2 = 1 + 2 × 3 answer 7, operator precedence in expressions

Calculation are as you type it on a calculator,
        1.00
+       2.00
×       3.00
════════════
        9.00 no operator precedence

test3 = 5^500 hover over test3, large values
test3 = 500 errors: variable already defined


calculations using finite precision if result over range
test4 = 100 ÷ 300 
test5 = 100 ÷ 0 divide by zero


      100.00
÷       0.00 division by zero error
════════════
      100.00 skipping error calculations

a = 100 b = 200

a = 500
b = 300
           a
+          b
════════════
      300.00 = c
+       5.00% ⥱ 15.00 adding 5%, c = 315
+          c   adding c to itself
════════════
      615.00
×       5.00% ⥱ 0.05 multiplying 615.00 by 0.05
════════════
       30.75

-     100.00 negation
-    -200.00 subtracting negetive numbers
════════════
      100.00

test line text with operators + - × ÷ % ^ -100 100+200

exp = 100 + 200 ÷ (500 + 20 - 520) divide by zero error in evaluation
exp1 = 1+2×((2+3)÷(25+25-50))
exp2 = 100 (200+200) no operator before '(' is dot product

      100.00
÷       test divide by undefined variable
════════════
      100.00
`