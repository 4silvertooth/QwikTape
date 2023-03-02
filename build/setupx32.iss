#define ARCH "x32"
#define AppVersion GetFileVersion(SourcePath + "\windows\" + ARCH + "\qwiktape.exe")
#define Application "QwikTape"
#define Executable "qwiktape.exe"
#define Url "https://github.com/4silvertooth/QwikTape"

[CustomMessages]
LaunchProgram=Launch {#Application} after finishing installation
CreateDesktopIcon=Create desktop icon

[Setup]
;SignTool=signtool
;SignedUninstaller=no
AppName={#Application}
AppVersion={#AppVersion}
AppVerName={#Application} {#AppVersion} {#ARCH}
AppPublisher=4silvertooth
AppPublisherURL={#Url}
AppSupportURL={#Url}
AppUpdatesURL={#Url}

; Installer executable's version resource info
VersionInfoCompany={#Url}
VersionInfoDescription={#Application} Installer
VersionInfoVersion={#AppVersion}

;This is in case an older version of the installer happened to be
DirExistsWarning=no

DefaultDirName={pf}\{#Application}
DefaultGroupName={#Application}
;DisableStartupPrompt=false
AllowNoIcons=true
OutputBaseFilename={#Application}-{#AppVersion}-{#ARCH}Setup

;Windows 2000 or later required
MinVersion=0,6.0

UninstallDisplayIcon={app}\{#Executable}

;Artwork References
WizardImageFile=..\main\res\Logo.bmp
WizardSmallImageFile=..\main\res\Logo-small.bmp
WizardImageStretch=false

Compression=lzma/ultra
InternalCompressLevel=ultra
SolidCompression=true

OutputDir=windows
ArchitecturesInstallIn64BitMode="x64"

[Files]
Source: {#SourcePath}\windows\{#ARCH}\qwiktape.exe; DestDir: "{app}"; DestName: {#executable}
Source: {#SourcePath}\..\sdk\bin\windows\{#ARCH}\sciter.dll; DestDir: "{app}"

[Run]
Filename: {app}\{#Executable}; Description: {cm:LaunchProgram,{#Application}}; Flags: nowait postinstall skipifsilent

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; \
    GroupDescription: "{cm:AdditionalIcons}";

[Icons]
Name: "{userdesktop}\{#Application}"; Filename: "{app}\{#Executable}"; Tasks: desktopicon
Name: "{group}\{#Application}"; Filename: "{app}\{#Executable}"; Tasks: desktopicon