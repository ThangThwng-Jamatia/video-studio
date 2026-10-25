// Face boxes with Apple Vision (no installs). Built by pipeline.py on first use:
//   swiftc -O facebox.swift -o facebox
// Usage: facebox <dir of *.png>   -> one JSON line per frame: {"f": name, "box": [x, y, w, h]} (0..1, top-left origin)
// The largest face per frame is reported; "box": null when no face is found.
import Vision
import CoreImage
import Foundation

let dir = CommandLine.arguments[1]
let files = try! FileManager.default.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".png") }.sorted()
for f in files {
    autoreleasepool {
        let url = URL(fileURLWithPath: dir).appendingPathComponent(f)
        guard let img = CIImage(contentsOf: url) else { return }
        let req = VNDetectFaceRectanglesRequest()
        try? VNImageRequestHandler(ciImage: img).perform([req])
        let faces = (req.results ?? []).sorted { $0.boundingBox.width * $0.boundingBox.height > $1.boundingBox.width * $1.boundingBox.height }
        if let b = faces.first?.boundingBox {
            // Vision: bottom-left origin -> convert to top-left
            print("{\"f\": \"\(f)\", \"box\": [\(b.minX), \(1 - b.maxY), \(b.width), \(b.height)]}")
        } else {
            print("{\"f\": \"\(f)\", \"box\": null}")
        }
    }
}
