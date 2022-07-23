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

# Features

* Write text, calculate, annotate it like you would on a paper or in a book.
* Never forget what was the calculation about by annotating it.
* Do calculations like addition `+`, subtraction `-`, division `÷`, multiplication `×`, percentage `%` and power `^`.
* Create unlimited tapes using [+] button in tabs bar, switch between tapes using tabs.
* View/Rename/Delete your saved tapes in the Bookmark menu, use the top left menu to view all tapes.
* Tapes are auto saved.
* The numbers will auto format and auto indented as you type.
* Numbers are formatted according to the locale.
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


<br></br>
EITHER 

[Download QwikTape](https://github.com/4silvertooth/QwikTape/releases) from releases,

OR 
```bash
git clone --recurse-submodules https://github.com/4silvertooth/QwikTape.git
```
and run

[**`run-win.bat`**](run-win.bat) for windows
[**`sh run-linux.sh`**](run-linux.sh) for linux
[**`sh run-macosx.sh`**](run-macosx.sh) for macosx


# What's in a name?
QwikTape the name is inspired by [QuickJs](https://github.com/bellard/quickjs) used by [Sciter](https://gitlab.com/sciter-engine/sciter-js-sdk), the engine which powers this application, and [Tape](https://en.wikipedia.org/wiki/Punched_tape) which is what it used to be called for such documents. 

The logo is inspired by the [Rail-Road](https://htmlpreview.github.io/?https://github.com/4silvertooth/QwikTape/blob/main/build/railroad-diagram.htm) diagram the QwikTape grammar produces and a calculator.

[Chevrotain](https://github.com/Chevrotain/chevrotain) toolkit to build the parser.

Also inspired by [CalcTape](https://calctape.app/), [Numi](https://numi.app/), [Soulver](https://soulver.app/), [Calca](http://calca.io/)

# Coming up.
* i18n
* Themes
* Printing support
* PDF export

# FAQ
To execute linux binary after downloading use this command. 
```sh 
sudo chmod +x qwiktape
``` 

To execute macosx binary use this command. 
```sh
sudo chmod +x qwiktape
sudo xattr -d com.apple.quarantine qwiktape
```

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

Start developer mode by using,

[**`run-win.bat -dev`**](run-win.bat) for windows

[**`sh run-linux.sh -dev`**](run-linux.sh) for linux

[**`sh run-macosx.sh -dev`**](run-macosx.sh) for macosx

from the `prompt`, it will give you developer view of QwikTape with controls to help you make changes. It launches `scapp` from sciter-js-sdk with [run-dev.html](run-dev.html) in `--debug` mode. Use inspector to inspect.

Use,

* `Diagram` to produce rail-road diagram of the parser grammar.

* `Refresh` to refresh the application frame for any changes to css or html.

* `Tests` to bring up all the tests, run tests from the toolwindow.

* `Screen Shot` to capture the image of the main application. 

* `Build` to produce final builds. (right now just windows)

<br></br>
I've build all assets like icons and logos inside [`src/assets`](src/assets) in figma and are licensed under [CC](
https://creativecommons.org/licenses/by/4.0/).