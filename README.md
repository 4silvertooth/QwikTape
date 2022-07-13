<img src="Logo.png" align="right"
     alt="QwikTape logo by Viral Ghelani" width="144" height="166">
Do calculations, annotate it like you would on a paper "qwikly".

```js
       100.00 my wallet balance
-       40.00 food
  ═══════════
        60.00
```
Create unlimited documents called tapes and switch between created tapes easily using browser like tabs.

<img src="build/main-screen.png" width="750">

<br></br>
[Download QwikTape](https://github.com/4silvertooth/QwikTape/releases) from releases.

# Features

* Write text, calculate, annotate it like you would on a paper or in a book.
* Never forget what was the calculation about by annotating it.
* Create unlimited tapes using [+] button in tabs bar, switch between tapes using tabs.
* View/Rename/Delete your saved tapes in the Bookmark menu, use the top left menu to view all tapes.
* Tapes are auto saved.
* Do calculations like addition `+`, subtraction `-`, division `÷`, multiplication `×`, percentage `%` and power `^`.
* The numbers will be auto formatted and auto indented as you type.
* User can define variables and use it in calculations.
* Hover cursor over variables to check it's value.
* Customize colors using the settings menu, number of decimals to use and indent length can be changed too.
* Tape calculation doesn't use operator precedence, the results will be as you would type it on a calculator. 
```
       1.00
+      2.00
×      3.00
═══════════
       9.00
```
* Expressions use operator precedence. `myvar = 1 + 2 × 3` myvar is `7`.
* All the calculations are done with infinite precision, so [`0.1 + 0.2 = 0.3`](https://0.30000000000000004.com/)

# What's in a name?
QwikTape the name is inspired by [QuickJs](https://github.com/bellard/quickjs) used by [Sciter](https://gitlab.com/sciter-engine/sciter-js-sdk), the engine which powers this application, and [Tape](https://en.wikipedia.org/wiki/Punched_tape) which is what it used to be called for such documents. 

The logo is inspired by the [Rail-Road](https://htmlpreview.github.io/?https://github.com/4silvertooth/QwikTape/blob/main/build/railroad-diagram.htm) diagram the QwikTape grammar produces and a calculator.

[Chevrotain](https://github.com/Chevrotain/chevrotain) toolkit to build the parser.

Also inspired by [CalcTape](https://calctape.app/), [Numi](https://numi.app/), [Soulver](https://soulver.app/), [Calca](http://calca.io/)

# Limitations
* Right now QwikTape editor can only recognize number without separators and with `.` as the decimal point, so number like `1,234.00` or `1.234,00` or `1234,00` won't be recognized, some countries use `,` as the decimal separator which is not supported as of yet.
* Others which I haven't discovered.

# Coming up.
* Linux binary
* Mac binary
* i18n
* localize number format

# Developers
QwikTape uses awesome Sciter SDK for its gui and chevrotain for the parser,

Clone the repo with submodules using,

```
git clone --recurse-submodules https://github.com/4silvertooth/QwikTape.git
```
Directory structure,

* `sdk` the sciter-js-sdk as a submodule

* `src` the source directory of the application
    * `assets` icons and logos
    * `components` all the reactor widgets
    * `chevrotain` the parser toolkit
    * `parser` the heart of it all
    * `storage` the database logic
    * <i>`main.htm`</i> the entry point
* `tests` all the tests goes in here
* `run-dev.html` for developers to debug and support in making changes.

Start by opening [**`run-dev-sciter.bat`**](run-dev-sciter.bat) for windows, it will give you developer view of the application with controls to help you make changes. It launches `scapp` from sciter-js-sdk with [run-dev.html](run-dev.html) in `--debug` mode. Use inspector to inspect.

Use,

* `Diagram` to produce rail-road diagram of the parser grammar.

* `Refresh` to refresh the application frame for any changes to css or html.

* `Tests` to bring up all the tests, run tests from the toolwindow.

* `Screen Shot` to capture the image of the main application. 

* `Build` to produce final builds. (right now just windows)

<br></br>
I've build all assets like icons and logos inside [`src/assets`](src/assets) in figma and are licensed under [CC](
https://creativecommons.org/licenses/by/4.0/).