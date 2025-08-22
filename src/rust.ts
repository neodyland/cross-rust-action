import { $ } from "bun";

async function extractInstalledRustTargets() {
    const targetsExtracted = (
        await $`rustup target list -q --installed`.quiet()
    )
        .text()
        .trim()
        .split("\n");
    return targetsExtracted;
}

async function extractRustTargets() {
    const targetsExtracted = (await $`rustup target list -q`.quiet())
        .text()
        .trim()
        .split("\n");
    return targetsExtracted;
}

export const [targets, installedTargets] = await Promise.all([
    extractRustTargets(),
    extractInstalledRustTargets(),
]);

export async function maybeAddRustTarget(target: string, nightly: boolean) {
    if (!installedTargets.includes(target)) {
        await $`rustup target add ${target}`.quiet();
    }
    if (nightly) {
        await $` rustup component add rust-src --toolchain nightly-${target}`;
    }
}
