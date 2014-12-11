var Target = require("./Target");

var Path = require("path");
var FS = require("fs-extra")

/* ------------------------------------------------------------------------------------------------------------------ *\
  * @description: This class has authority over the compilation of files within its subsequent target directories. A
                  profile can contain multiple instances of Target that all report to its Profile when a file is
                  either created, deleted, or updated. When this occurs, the profile will authorise a compile of all
                  its targets.
  * @parameters:
    * compiler [object] - Reference to an instance of the compiler class.
    * profile [object]  - Pointer to a profile within the configuration object.
  * @requires:
    * Target:   - Used during the instantiation of the Profile when iterating through the configured targets.
    * path:     - Used to retrieve the directory portion of cache profiles and to determine the concatenation mode.
    * fs-extra: - Chosen over the standard fs module for mkdirsSync and used to remove old output files.
\* ------------------------------------------------------------------------------------------------------------------ */

function Profile(compiler, profile) {
    this.compiler = compiler;
    this.id = profile.id;
    this.name = profile.name;
    this.output = Path.join(compiler.directory, profile.output);
    this.concatenate = (Path.extname(this.output).length > 0);

    this.targets = profile.targets.map(function(target, id) {
        return new Target(this, target, id);
    }, this);
}

/* ------------------------------------------------------------------------------------------------------------------ *\
  * @description: This method loops through each target and compiles them. Depending on the output specified, files
                  may be concatinated or saved individually.
  * @parameters:
    * manualCompile [boolean]: Only true when the compiler is manually compiled otherwise it's falsy.
\* ------------------------------------------------------------------------------------------------------------------ */
Profile.prototype.compile = function _compile(manualCompile) {
    if (FS.existsSync(this.output)) {
        if (!FS.statSync(this.output).isDirectory()) {
            Logger.debug("Removing old output file.");
            FS.unlinkSync(this.output);
        }
    } else {
        FS.mkdirsSync(Path.dirname(this.output));
    }

    Logger.debug("Compiling Targets for Profile '" + this.name + "'.");
    this.targets.forEach(function(target) { target.compile(manualCompile); });
};

module.exports = Profile;