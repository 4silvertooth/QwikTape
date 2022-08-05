#include "sciter-x-window.hpp"
#include "sciter-x-graphics.hpp"
#include "sciter-x-types.h"

class qwiktape: public sciter::window {
public:
  qwiktape() : window(SW_TITLEBAR | SW_RESIZEABLE | SW_CONTROLS | SW_MAIN | SW_GLASSY ) {}
};

#include "resources.cpp"

int uimain(std::function<int()> run ) {
  SciterSetOption(NULL, SCITER_SET_SCRIPT_RUNTIME_FEATURES,
                          ALLOW_FILE_IO |
                          ALLOW_SOCKET_IO |
                          ALLOW_EVAL |
                          ALLOW_SYSINFO );
#ifdef _DEBUG
  sciter::debug_output_console console;
#endif
  sciter::archive::instance().open(aux::elements_of(resources));
  sciter::om::hasset<qwiktape> pwin = new qwiktape();
  pwin->load(WSTR("this://app/main.htm"));
  pwin->expand();
  return run();
}
