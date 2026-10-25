// Person matte with Apple Vision (no installs). Built by pipeline.py on first use:
//   swiftc -O personmatte.swift -o personmatte
// Usage: personmatte <in.png|in_dir> <out.png|out_dir>
//   dir mode: every *.png in in_dir -> same name in out_dir (white = person, black = background)
import Vision
import CoreImage
import AppKit

func matte(_ inURL: URL, _ outURL: URL, _ ctx: CIContext) {
    guard let img = CIImage(contentsOf: inURL) else { print("skip", inURL.path); return }
    let req = VNGeneratePersonSegmentationRequest()
    req.qualityLevel = .accurate
    req.outputPixelFormat = kCVPixelFormatType_OneComponent8
    try? VNImageRequestHandler(ciImage: img).perform([req])
    guard let pb = req.results?.first?.pixelBuffer else { print("no result", inURL.path); return }
    let mask = CIImage(cvPixelBuffer: pb)
    let m = mask.transformed(by: .init(scaleX: img.extent.width / mask.extent.width,
                                       y: img.extent.height / mask.extent.height))
    let cg = ctx.createCGImage(m, from: img.extent)!
    let rep = NSBitmapImageRep(cgImage: cg)
    try! rep.representation(using: NSBitmapImageRep.FileType.png, properties: [:])!.write(to: outURL)
}

let a = CommandLine.arguments
let ctx = CIContext()
let fm = FileManager.default
var isDir: ObjCBool = false
if fm.fileExists(atPath: a[1], isDirectory: &isDir), isDir.boolValue {
    try? fm.createDirectory(atPath: a[2], withIntermediateDirectories: true)
    let files = try! fm.contentsOfDirectory(atPath: a[1]).filter { $0.hasSuffix(".png") }.sorted()
    for f in files {
        autoreleasepool {
            matte(URL(fileURLWithPath: a[1]).appendingPathComponent(f), URL(fileURLWithPath: a[2]).appendingPathComponent(f), ctx)
        }
    }
    print("matted", files.count, "frames")
} else {
    matte(URL(fileURLWithPath: a[1]), URL(fileURLWithPath: a[2]), ctx)
    print("ok")
}
