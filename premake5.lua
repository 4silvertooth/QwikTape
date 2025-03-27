if( _TARGET_OS ~= "_macosx") then  -- we are not auto generating XCode solutions for a while
                                  -- structure of typical XCode is not trivial - requires manual inputs.

function settargetdir() 
  targetdir ("build/" .. _TARGET_OS .. "/%{cfg.platform}")
  filter {}
end

workspace "qwiktape"
  configurations { "Debug", "Release" }
  cppdialect "C++17" 
  staticruntime "On"

  filter "system:windows"
    configurations { "Debug", "Release" }
    location ("build/" .. _TARGET_OS)
    links { "shell32", "advapi32", "ole32", "oleaut32", "comdlg32" }
    platforms { "x32", "x64", "arm64" }
    systemversion "latest"
  
  filter "system:macosx"
    location ("build/" .. _TARGET_OS)
    links { "CoreFoundation.framework", "Cocoa.framework", "IOKit.framework" }
    platforms { "x64" }
  
  filter "system:linux"
    location("build/" .. _TARGET_OS)
    platforms { "x64", "arm32", "arm64" }
    defines { "_GNU_SOURCE" }
    buildoptions {
     "`pkg-config gtk+-3.0 --cflags`",      
     "-fPIC",
     "-Wno-unknown-pragmas",
     "-Wno-write-strings",
     "-ldl",
    }
    linkoptions { 
      "-fPIC",
      "-pthread",
    }
    prebuildcommands { 
      "\"%{prj.location}/../../sdk/bin/".. _TARGET_OS .. "/packfolder\" \"%{prj.location}/../../src\" \"%{prj.location}/../../main/resources.cpp\" -v \"resources\""
    }

  filter {}

  includedirs { "sdk/include" }  

  flags { "MultiProcessorCompile" }

  filter "platforms:x32"
    architecture "x86"
  filter "platforms:x64"
    architecture "x86_64"  
  filter "platforms:arm64"
    architecture "ARM64"  
  filter "platforms:arm32"
    architecture "ARM"  


  filter {"platforms:x32", "system:windows"}
    defines { "WIN32" }
  filter {"platforms:x64", "system:windows"}
    defines { "WIN32","WIN64" }      
  filter {"platforms:arm64", "system:windows"}
    defines { "WIN32","WIN64", "ARM64" }      

  filter "configurations:Debug*"
    defines { "DEBUG", "_DEBUG" }
    symbols "On"

  filter "configurations:Release*"
    defines { "NDEBUG"}  
    optimize "Size"
    symbols "Off"
    flags { "LinkTimeOptimization" }

  filter {"system:windows"}
    defines { "_CRT_SECURE_NO_WARNINGS" } 
 
  filter {}

project "qwiktape"
  kind "WindowedApp"
  language "C++"

  dpiawareness "HighPerMonitor"

  files { "main/qwiktape.cpp" }

  settargetdir()

  filter "system:windows"
    files {"sdk/include/sciter-*.h",
           "sdk/include/sciter-*.hpp",
           "sdk/include/aux-*.*",
           "sdk/include/sciter-main.cpp",
           "main/res/dpi-aware.manifest",
           "main/res/qwiktape.rc",
          }
    links { "shell32", "advapi32", "ole32", "oleaut32", "gdi32", "comdlg32" }
    prebuildcommands { 
      "\"%{prj.location}..\\..\\sdk\\bin\\".. _TARGET_OS .. "\\packfolder.exe\" \"%{prj.location}..\\..\\src\" \"%{prj.location}..\\..\\main\\resources.cpp\" -v \"resources\""
    }

  filter "system:macosx"
    files {"sdk/include/sciter-osx-main.mm"}
    targetdir ("build/" .. _TARGET_OS .. "/%{cfg.platform}")
  filter "system:linux"
    files {"sdk/include/sciter-gtk-main.cpp"}
    buildoptions {
       "`pkg-config gtk+-3.0 --cflags`"
    }
    linkoptions { 
       "`pkg-config gtk+-3.0 --libs`",
       "`pkg-config fontconfig --libs`",
       "-fPIC",
       "-pthread",
       "-Wl,--no-undefined",
       "-ldl",
       "-no-pie"
    }

  filter {}
end
