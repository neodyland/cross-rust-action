// @bun
var{$:l}=globalThis.Bun;var f=/\n +},\n +\.libc += +\.{(?<targets>[^}]+)},\n +\.glibc += +\.{\n/m,p=/"(?<string>[_\-a-zA-Z0-9]+)"/g;async function m(){let t=(await l`zig targets`.quiet()).text().match(f)?.groups?.targets?.trim();if(!t)throw new Error("Failed to extract targets from zig targets output");let i=[];for(let o of t.matchAll(p)){let r=o.groups?.string;if(r)i.push(r)}return i}var a=await m(),g=Bun.which("zig");if(!g)throw new Error("Zig compiler not found. Please install Zig.");import{parseArgs as h}from"util";import{mkdir as $,exists as d}from"fs/promises";import s from"path";var{$:c}=globalThis.Bun;async function w(){let{values:t}=h({args:Bun.argv,options:{zigtarget:{type:"string"},dir:{type:"string",default:"./target/cross-rust"},rusttarget:{type:"string"},sh:{type:"string",default:"/bin/bash"},toolchain:{type:"string",default:"stable"}},strict:!0,allowPositionals:!0});if(!t.zigtarget)return console.error("No zigtarget specified. Use --zigtarget to specify a zigtarget."),console.error(`Valid zigtargets are: ${a.join(", ")}`),!1;if(!a.includes(t.zigtarget))return console.error(`ZigTarget "${t.zigtarget}" is not valid.`),console.error(`Valid zigtargets are: ${a.join(", ")}`),!1;let i=`#!/usr/bin/env bun
import { $ } from "bun";

const args = process.argv.slice(2);
const kept: string[] = [];
let nextSkip = false;
for (const a of args) {
    if (a === "--target") {
        nextSkip = true;
        continue;
    } else if (nextSkip) {
        nextSkip = false;
        continue;
    } else if (a.startsWith("--target")) {
        continue;
    }
    kept.push(a);
}

await $\`${g} cc -target ${t.zigtarget} \${kept}\`;`,o=s.resolve(t.dir),r=s.join(o,"bin");if(!await d(r))await $(r,{recursive:!0});let e=s.join(r,"cross-rust-cc");await Bun.write(e,i),await c`chmod +x ${e}`.quiet();let u=`#!${t.sh}
export CC=${e}
${Bun.which("cargo")} +${t.toolchain} --config 'target.${t.rusttarget}.linker="${e}"' --config 'target.${t.rusttarget}.rustflags=["-C", "link-arg=-fuse-ld=${e}"]' build --target ${t.rusttarget} $@`,n=s.join(r,"cross-cargo-build");return await Bun.write(n,u),await c`chmod +x ${n}`.quiet(),console.log(n),!0}var z=await w();process.exit(z?0:1);
