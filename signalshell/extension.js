const { Gio, GLib, Pango, St } = imports.gi;
const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const KEY_PLIGHT = 'p-light';

let themeContext = St.ThemeContext.get_for_stage(global.stage);
let stylesheetFile;

this._sysiSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface', });
this._sysa11yiSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.a11y.interface', });
this._extSettings = ExtensionUtils.getSettings();

function _loadStyleheet()
{    
    if(this._sysa11yiSettings.get_boolean('high-contrast')) {
        stylesheetPath = GLib.build_filenamev(
            [GLib.get_user_data_dir(), 'gnome-shell/theme', 'gnome-shell-high-contrast.css']
        );
    }
    else if(!this._sysa11yiSettings.get_boolean('high-contrast') && this._sysiSettings.get_string('color-scheme') === 'prefer-dark') {
        stylesheetPath = GLib.build_filenamev(
            [GLib.get_user_data_dir(), 'gnome-shell/theme/', 'gnome-shell.css']
        );
    }
    else if(!this._sysa11yiSettings.get_boolean('high-contrast') && this._sysiSettings.get_string('color-scheme') === 'default' && this._extSettings.get_boolean('p-light')) {
        stylesheetPath = GLib.build_filenamev(
            [GLib.get_user_data_dir(), 'gnome-shell/theme/', 'gnome-shell.css']
        );
    }
    else {
        stylesheetPath = GLib.build_filenamev(
            [GLib.get_user_data_dir(), 'gnome-shell/theme', 'gnome-shell-light.css']
        );
    }
    
    Main.setThemeStylesheet(stylesheetPath);
    Main.loadTheme();

}

function _signalloadStyleheet() {
    this.a11ysig = this._sysa11yiSettings.connect('changed::high-contrast', () => {
        this._loadStyleheet();
    });
   this.isig = this._sysiSettings.connect('changed::color-scheme', () => {
        this._loadStyleheet();
    });
    this.extsig = this._extSettings.connect('changed::p-light', () => {
        this._loadStyleheet();
    });
}
    


function _unloadStyleheet()
{
    Main.setThemeStylesheet(null);
    Main.loadTheme();
}

function enable()
{
    this._loadStyleheet();
    this._signalloadStyleheet();    
}

function disable()
{
    //if(Main.sessionMode.currentMode !== 'unlock-dialog'){    
        this._extSettings.disconnect(this.extsig);
        this._sysa11yiSettings.disconnect(this.a11sig);
        this._sysiSettings.disconnect(this.isig);
        this._unloadStyleheet();    
    //}
}