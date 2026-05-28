export type ResearchPaper = {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  tags: string[];
  type: "free" | "paid";
  price?: number;
  publishedAt: string;
  pages: number;
  views: number;
  likes: number;
  comments: number;
  pdfUrl: string;
  coverImage?: string;
  institution?: string;
};

export const researchPapers: ResearchPaper[] = [
  {
    id: "rp-001",
    title: "Smart Home Automation Using ESP32 and MQTT Protocol",
    authors: ["Arun Sharma", "Priya Thapa"],
    abstract:
      "This paper presents a comprehensive implementation of a smart home automation system leveraging the ESP32 microcontroller and MQTT lightweight messaging protocol. We explore the design architecture, real-time sensor integration, and remote control capabilities over Wi-Fi, achieving sub-100ms response latency with minimal power consumption.",
    category: "IoT",
    tags: ["ESP32", "MQTT", "Smart Home", "Automation", "Wi-Fi"],
    type: "free",
    publishedAt: "2025-11-12",
    pages: 14,
    views: 3420,
    likes: 218,
    comments: 34,
    pdfUrl: "/papers/file-sample.pdf",
    institution: "Tribhuvan University",
  },
  {
    id: "rp-002",
    title: "Deep Learning for Nepali Handwritten Character Recognition",
    authors: ["Sushil Khadka", "Anjali Rai", "Bikash Gurung"],
    abstract:
      "We propose a convolutional neural network architecture specifically optimized for recognizing handwritten Devanagari characters used in the Nepali language. Our model achieves 97.4% accuracy on the NHD-10k benchmark dataset, outperforming existing methods by a significant margin while maintaining a compact model size suitable for edge deployment.",
    category: "Machine Learning",
    tags: ["Deep Learning", "CNN", "Nepali", "OCR", "Devanagari"],
    type: "paid",
    price: 299,
    publishedAt: "2025-12-03",
    pages: 22,
    views: 5104,
    likes: 412,
    comments: 67,
    pdfUrl: "/papers/nepali-ocr-dl.pdf",
    institution: "Kathmandu University",
  },
  {
    id: "rp-003",
    title: "LoRa-Based Long-Range Sensor Network for Agricultural Monitoring",
    authors: ["Ramesh Bhandari"],
    abstract:
      "This research investigates the deployment of LoRaWAN sensor networks across Terai farmlands for real-time monitoring of soil moisture, temperature, and crop health metrics. Our gateway-node topology achieves a communication range of up to 8 km in rural terrain with battery life exceeding 18 months per node.",
    category: "IoT",
    tags: ["LoRa", "Agriculture", "Sensor Network", "LoRaWAN", "Rural IoT"],
    type: "paid",
    price: 399,
    publishedAt: "2025-10-28",
    pages: 18,
    views: 2887,
    likes: 189,
    comments: 21,
    pdfUrl: "/papers/lora-agriculture.pdf",
    institution: "Pokhara University",
  },
  {
    id: "rp-004",
    title: "Federated Learning for Privacy-Preserving Healthcare Analytics",
    authors: ["Nisha Maharjan", "Rohan Karki"],
    abstract:
      "We present a federated learning framework tailored for distributed hospital data in low-bandwidth environments. By training models locally and aggregating only gradients, our system enables collaborative AI model development without exposing sensitive patient data, complying with healthcare data privacy regulations while achieving model accuracy within 2% of centralized training.",
    category: "AI & Privacy",
    tags: ["Federated Learning", "Healthcare", "Privacy", "Distributed AI"],
    type: "paid",
    price: 499,
    publishedAt: "2026-01-15",
    pages: 26,
    views: 6723,
    likes: 534,
    comments: 89,
    pdfUrl: "/papers/federated-healthcare.pdf",
    institution: "Tribhuvan University",
  },
  {
    id: "rp-005",
    title:
      "Blockchain-Based Supply Chain Transparency for Himalayan Tea Export",
    authors: ["Dipesh Shrestha", "Kavita Tamang"],
    abstract:
      "This paper explores applying permissioned blockchain technology to create an immutable traceability chain for Himalayan tea from farm to international buyer. We implemented a Hyperledger Fabric network among 14 tea cooperatives in Ilam district, reducing counterfeit incidents by 91% in a 6-month pilot and improving export revenue by 23%.",
    category: "Blockchain",
    tags: ["Blockchain", "Hyperledger", "Supply Chain", "Tea", "Nepal"],
    type: "free",
    publishedAt: "2025-09-08",
    pages: 20,
    views: 4211,
    likes: 301,
    comments: 45,
    pdfUrl: "/papers/blockchain-tea.pdf",
    institution: "Nepal Engineering College",
  },
  {
    id: "rp-006",
    title: "Real-Time Object Detection on Edge Devices Using YOLOv11-Nano",
    authors: ["Santosh Paudel", "Mandira Adhikari", "Hari Dhakal"],
    abstract:
      "We demonstrate the deployment of a quantized YOLOv11-Nano model on Raspberry Pi 5 and NVIDIA Jetson Nano for real-time pedestrian and vehicle detection in Kathmandu traffic. Our pipeline achieves 28 FPS on Jetson Nano with mAP@0.5 of 74.3%, enabling low-cost intelligent traffic management without cloud dependency.",
    category: "Computer Vision",
    tags: ["YOLO", "Edge AI", "Object Detection", "Raspberry Pi", "Traffic"],
    type: "paid",
    price: 399,
    publishedAt: "2026-02-20",
    pages: 19,
    views: 7832,
    likes: 621,
    comments: 103,
    pdfUrl: "/papers/yolo-edge.pdf",
    institution: "Kathmandu University",
  },
];

export const categories = [
  "All",
  "IoT",
  "Machine Learning",
  "AI & Privacy",
  "Blockchain",
  "Computer Vision",
];
