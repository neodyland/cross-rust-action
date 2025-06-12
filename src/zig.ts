import { $ } from "bun";

const reTargets =
    /\n +},\n +\.libc += +\.{(?<targets>[^}]+)},\n +\.glibc += +\.{\n/m;
const reString = /"(?<string>[_\-a-zA-Z0-9]+)"/g;

async function extractZigTargets() {
    const targetsExtracted = (await $`zig targets`.quiet())
        .text()
        .match(reTargets)
        ?.groups?.targets?.trim();
    if (!targetsExtracted) {
        throw new Error("Failed to extract targets from zig targets output");
    }
    const targets = [];
    for (const match of targetsExtracted.matchAll(reString)) {
        const target = match.groups?.string;
        if (target) {
            targets.push(target);
        }
    }
    return targets;
}

export const targets = await extractZigTargets();

export const zigPath = Bun.which("zig");

if (!zigPath) {
    throw new Error("Zig compiler not found. Please install Zig.");
}
