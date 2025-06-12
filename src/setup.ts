import { targets as zigTargets, zigPath } from "./zig";
import { targets as rustTargets, maybeAddRustTarget } from "./rust";
import { parseArgs } from "node:util";
import { mkdir, exists } from "node:fs/promises";
import path from "node:path";
import { $ } from "bun";

async function main() {
    const { values } = parseArgs({
        args: Bun.argv,
        options: {
            zigtarget: {
                type: "string",
            },
            dir: {
                type: "string",
                default: "./target/cross-rust",
            },
            rusttarget: {
                type: "string",
            },
            sh: {
                type: "string",
                default: "/bin/sh",
            },
        },
        strict: true,
        allowPositionals: true,
    });
    if (!values.zigtarget) {
        console.error(
            "No zigtarget specified. Use --zigtarget to specify a zigtarget.",
        );
        console.error(`Valid zigtargets are: ${zigTargets.join(", ")}`);
        return false;
    }
    if (!zigTargets.includes(values.zigtarget)) {
        console.error(`ZigTarget "${values.zigtarget}" is not valid.`);
        console.error(`Valid zigtargets are: ${zigTargets.join(", ")}`);
        return false;
    }
    const cc = `#!${values.sh}
${zigPath} cc -target ${values.zigtarget} $@`;
    const dir = path.resolve(values.dir);
    const bin = path.join(dir, "bin");
    if (!(await exists(bin))) {
        await mkdir(bin, { recursive: true });
    }
    const ccPath = path.join(bin, "cross-rust-cc");
    await Bun.write(ccPath, cc);
    await $`chmod +x ${ccPath}`.quiet();
    if (!values.rusttarget) {
        console.error(
            "No rusttarget specified. Use --rusttarget to specify a rusttarget.",
        );
        console.error(`Valid rusttargets are: ${rustTargets.join(", ")}`);
        return false;
    }
    await maybeAddRustTarget(values.rusttarget);
    const crossCargo = `#!${values.sh}
export CC=${ccPath}
${Bun.which("cargo")} --config 'target.${values.rusttarget}.linker="${ccPath}"' build --target ${values.rusttarget} $@`;
    const crossCargoPath = path.join(bin, "cross-cargo-build");
    await Bun.write(crossCargoPath, crossCargo);
    await $`chmod +x ${crossCargoPath}`.quiet();
    console.log(crossCargoPath);
    return true;
}

const ok = await main();
process.exit(ok ? 0 : 1);
