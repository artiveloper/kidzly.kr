// 모노레포 standalone 출력(.next/standalone/apps/web)을 단일 앱 구조(.next/standalone/server.js)로 펴는 빌드 후처리 스크립트
// Hostinger는 output: "standalone"을 강제하고 .next/standalone 루트의 server.js만 실행한다.
// 모노레포에서는 server.js가 apps/web 아래로 중첩돼 배포 후 'next'를 찾지 못하고 503이 난다.
import fs from "node:fs"
import path from "node:path"

const appDir = process.cwd()
const standaloneDir = path.join(appDir, ".next", "standalone")
const nestedDir = path.join(standaloneDir, "apps", "web")

// 로컬 빌드처럼 standalone 출력이 없거나 이미 평평하면 할 일이 없다
if (!fs.existsSync(path.join(nestedDir, "server.js"))) {
    process.exit(0)
}

// pnpm 심링크는 상대 경로라 한 단계 위로 옮기면 깨진다. 옮긴 뒤 위치 기준으로 다시 건다
function moveLink(from, to) {
    const target = path.resolve(path.dirname(from), fs.readlinkSync(from))
    fs.unlinkSync(from)
    fs.symlinkSync(path.relative(path.dirname(to), target), to)
}

function mergeNodeModules(from, to) {
    fs.mkdirSync(to, { recursive: true })
    for (const name of fs.readdirSync(from)) {
        const src = path.join(from, name)
        const dest = path.join(to, name)
        const stat = fs.lstatSync(src)
        if (name.startsWith("@") && stat.isDirectory()) {
            mergeNodeModules(src, dest)
        } else if (fs.existsSync(dest)) {
            continue
        } else if (stat.isSymbolicLink()) {
            moveLink(src, dest)
        } else {
            fs.renameSync(src, dest)
        }
    }
}

for (const name of fs.readdirSync(nestedDir)) {
    const src = path.join(nestedDir, name)
    const dest = path.join(standaloneDir, name)
    if (name === "node_modules") {
        mergeNodeModules(src, dest)
    } else {
        fs.rmSync(dest, { recursive: true, force: true })
        fs.renameSync(src, dest)
    }
}
fs.rmSync(path.join(standaloneDir, "apps"), { recursive: true, force: true })

// standalone은 정적 자산을 담지 않는다. server.js가 직접 서빙하도록 함께 넣는다
fs.cpSync(path.join(appDir, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
    recursive: true,
})
fs.cpSync(path.join(appDir, "public"), path.join(standaloneDir, "public"), { recursive: true })

console.log("[flatten-standalone] .next/standalone/server.js 로 평탄화 완료")
