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

async function installRustup() {
    const output = "install-rust-arandompath.sh";
    await $`curl https://sh.rustup.rs -o ${output}`;
    await $`sh ${output} -y`;
    await $`rm ${output}`;
}

await installRustup();

export const [targets, installedTargets] = await Promise.all([
    extractRustTargets(),
    extractInstalledRustTargets(),
]);

export async function maybeAddRustTarget(target: string, nightly: boolean) {
    if (!installedTargets.includes(target)) {
        await $`rustup target add ${target}`;
    }
    if (nightly) {
        await $`rustup component add rust-src --toolchain nightly-${target}`;
    }
}
