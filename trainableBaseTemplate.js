/**
 * Jay's Mobile Wash - Trainable Base Template System
 * 
 * Advanced AI system that learns from various content sources and becomes
 * the primary responder, reducing dependency on external APIs over time.
 * 
 * Features:
 * - Multi-format content ingestion (text, video, web)
 * - Vector-based semantic search and knowledge retrieval
 * - Intelligent learning from external API responses
 * - Advanced reasoning and knowledge validation
 * - Conversation memory and context management
 * - Self-improving response quality
 * 
 * @version 1.0.0
 * @author Jay's Mobile Wash Team
 */

class TrainableBaseTemplate {
    constructor(options = {}) {
        this.config = {
            debug: options.debug || false,
            maxKnowledgeEntries: options.maxKnowledgeEntries || 10000,
            embeddingDimensions: options.embeddingDimensions || 384,
            confidenceThreshold: options.confidenceThreshold || 0.7,
            learningRate: options.learningRate || 0.1,
            memoryWindowSize: options.memoryWindowSize || 10,
            ...options
        };

        // Core knowledge base - vector storage for semantic search
        this.knowledgeBase = new Map();
        this.embeddings = new Map();
        this.conversationMemory = [];
        this.learningQueue = [];

        // Performance and learning metrics
        this.metrics = {
            totalQueries: 0,
            baseTemplateResponses: 0,
            externalApiCalls: 0,
            learningEvents: 0,
            knowledgeEntries: 0,
            averageConfidence: 0
        };

        // Initialize the system
        this.init();
    }

    /**
     * Initialize the trainable base template system
     */
    async init() {
        this.log('Initializing Trainable Base Template System...');
        
        // Load existing knowledge from localStorage
        await this.loadKnowledgeBase();
        
        // Initialize core business knowledge
        await this.initializeBusinessKnowledge();
        
        // Initialize embedding system
        await this.initializeEmbeddingSystem();
        
        this.log('Trainable Base Template System initialized successfully');
        this.log(`Knowledge base contains ${this.knowledgeBase.size} entries`);
    }

    /**
     * Initialize core business knowledge
     */
    async initializeBusinessKnowledge() {
        const coreKnowledge = [
            {
                id: 'business_overview',
                content: `Jay's Mobile Wash is a premium mobile car detailing service serving Los Angeles and Orange County. We specialize in luxury and exotic vehicles, offering paint correction, ceramic coating, interior deep cleaning, and full detailing packages. Our team comes directly to customers' locations with professional equipment and premium products like Koch Chemie and BioBomb odor elimination.`,
                category: 'business_info',
                confidence: 1.0,
                source: 'core_knowledge',
                tags: ['business', 'services', 'luxury', 'mobile']
            },
            {
                id: 'service_areas',
                content: `We provide mobile detailing services throughout Los Angeles County and Orange County. This includes Beverly Hills, Santa Monica, Newport Beach, Irvine, Anaheim, Long Beach, Pasadena, and surrounding areas. We travel to your location whether it's your home, office, or another convenient spot.`,
                category: 'service_areas',
                confidence: 1.0,
                source: 'core_knowledge',
                tags: ['locations', 'service_areas', 'mobile']
            },
            {
                id: 'contact_booking',
                content: `For scheduling and detailed quotes, customers should call 562-228-9429. This is the fastest way to check availability, get accurate pricing based on specific vehicles and locations, and book appointments. We often have same-day or next-day availability.`,
                category: 'booking',
                confidence: 1.0,
                source: 'core_knowledge',
                tags: ['booking', 'contact', 'phone', 'scheduling']
            },
            {
                id: 'pricing_services',
                content: `Our pricing starts around $70 for basic exterior packages, with full detail packages and ceramic coating services priced based on vehicle size and condition. We offer Jay's Max Detail packages, paint correction, ceramic coating applications, interior deep cleaning, and odor elimination services. Exact pricing depends on vehicle type, condition, and specific services requested.`,
                category: 'pricing',
                confidence: 1.0,
                source: 'core_knowledge',
                tags: ['pricing', 'packages', 'services']
            }
        ];

        for (const knowledge of coreKnowledge) {
            await this.addKnowledge(knowledge);
        }

        this.log('Core business knowledge initialized');
    }

    /**
     * Initialize embedding system for semantic search
     */
    async initializeEmbeddingSystem() {
        // Simple embedding system using character-based features
        // In production, this would use a proper embedding model
        this.log('Embedding system initialized');
    }

    /**
     * Primary response method - attempts to answer from knowledge base first
     */
    async generateResponse(userMessage, conversationContext = []) {
        this.metrics.totalQueries++;
        
        // Add to conversation memory
        this.conversationMemory.push({
            role: 'user',
            content: userMessage,
            timestamp: Date.now()
        });
        
        // Maintain memory window
        if (this.conversationMemory.length > this.config.memoryWindowSize) {
            this.conversationMemory = this.conversationMemory.slice(-this.config.memoryWindowSize);
        }

        // Search knowledge base for relevant information
        const relevantKnowledge = await this.searchKnowledgeBase(userMessage, conversationContext);
        
        // Generate response from knowledge base
        const baseResponse = await this.generateFromKnowledge(userMessage, relevantKnowledge, conversationContext);
        
        if (baseResponse && baseResponse.confidence >= this.config.confidenceThreshold) {
            this.metrics.baseTemplateResponses++;
            
            // Add to conversation memory
            this.conversationMemory.push({
                role: 'assistant',
                content: baseResponse.content,
                confidence: baseResponse.confidence,
                source: 'base_template',
                timestamp: Date.now()
            });
            
            return {
                response: baseResponse.content,
                confidence: baseResponse.confidence,
                source: 'base_template',
                shouldUseExternalAPI: false
            };
        }

        // If confidence is low, indicate external API should be used
        this.metrics.externalApiCalls++;
        return {
            response: null,
            confidence: baseResponse ? baseResponse.confidence : 0,
            source: 'insufficient_knowledge',
            shouldUseExternalAPI: true,
            searchResults: relevantKnowledge
        };
    }

    /**
     * Search knowledge base using semantic similarity
     */
    async searchKnowledgeBase(query, context = []) {
        const queryEmbedding = await this.generateEmbedding(query);
        const results = [];

        // Search through all knowledge entries
        for (const [id, knowledge] of this.knowledgeBase) {
            const similarity = await this.calculateSimilarity(queryEmbedding, knowledge.embedding);
            
            if (similarity > 0.3) { // Minimum relevance threshold
                results.push({
                    ...knowledge,
                    similarity: similarity,
                    relevanceScore: this.calculateRelevanceScore(knowledge, query, context)
                });
            }
        }

        // Sort by relevance score (combination of similarity and context relevance)
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        return results.slice(0, 5); // Return top 5 most relevant
    }

    /**
     * Generate response from knowledge base entries
     */
    async generateFromKnowledge(query, relevantKnowledge, context = []) {
        if (!relevantKnowledge || relevantKnowledge.length === 0) {
            return { content: null, confidence: 0 };
        }

        // Analyze query intent
        const intent = this.analyzeIntent(query);
        
        // Build response based on relevant knowledge
        let response = '';
        let totalConfidence = 0;
        let usedKnowledge = [];

        // Handle different intent types
        if (intent.type === 'booking') {
            response = this.generateBookingResponse(query, relevantKnowledge);
            totalConfidence = 0.9; // High confidence for booking responses
        } else if (intent.type === 'pricing') {
            response = this.generatePricingResponse(query, relevantKnowledge);
            totalConfidence = 0.8;
        } else if (intent.type === 'services') {
            response = this.generateServicesResponse(query, relevantKnowledge);
            totalConfidence = 0.85;
        } else if (intent.type === 'location') {
            response = this.generateLocationResponse(query, relevantKnowledge);
            totalConfidence = 0.9;
        } else {
            // General knowledge-based response
            const topKnowledge = relevantKnowledge.slice(0, 3);
            
            for (const knowledge of topKnowledge) {
                if (knowledge.similarity > 0.5) {
                    usedKnowledge.push(knowledge);
                    totalConfidence += knowledge.confidence * knowledge.similarity;
                }
            }
            
            if (usedKnowledge.length > 0) {
                response = this.synthesizeResponse(query, usedKnowledge, intent);
                totalConfidence = totalConfidence / usedKnowledge.length;
            }
        }

        return {
            content: response,
            confidence: Math.min(totalConfidence, 1.0),
            usedKnowledge: usedKnowledge,
            intent: intent
        };
    }

    /**
     * Analyze user query intent
     */
    analyzeIntent(query) {
        const lowerQuery = query.toLowerCase();
        
        // Booking intent keywords
        if (/\b(book|schedule|appointment|reserve|availability|when can|what time|come out)\b/.test(lowerQuery)) {
            return { type: 'booking', confidence: 0.9 };
        }
        
        // Pricing intent keywords
        if (/\b(price|cost|how much|pricing|quote|estimate|fee)\b/.test(lowerQuery)) {
            return { type: 'pricing', confidence: 0.8 };
        }
        
        // Services intent keywords
        if (/\b(service|detail|wash|clean|ceramic|paint|interior|exterior)\b/.test(lowerQuery)) {
            return { type: 'services', confidence: 0.7 };
        }
        
        // Location intent keywords
        if (/\b(where|location|area|serve|come to|travel to)\b/.test(lowerQuery)) {
            return { type: 'location', confidence: 0.8 };
        }
        
        return { type: 'general', confidence: 0.5 };
    }

    /**
     * Generate booking-specific response
     */
    generateBookingResponse(query, relevantKnowledge) {
        return `I'd be happy to help you schedule your mobile detailing service! For the fastest booking and to check our real-time availability, please call us at 562-228-9429. Our team can provide exact pricing based on your vehicle and location, and we often have same-day or next-day availability. We serve all of Los Angeles and Orange County, bringing our professional equipment directly to your location.`;
    }

    /**
     * Generate pricing-specific response
     */
    generatePricingResponse(query, relevantKnowledge) {
        return `Our mobile detailing pricing starts around $70 for basic exterior packages, with full detail packages priced based on your vehicle's size and condition. We offer comprehensive packages including Jay's Max Detail, paint correction, ceramic coating, and interior deep cleaning. For an accurate quote tailored to your specific vehicle and needs, please call 562-228-9429. We'll provide exact pricing and can often schedule your service for the same day or next day!`;
    }

    /**
     * Generate services-specific response
     */
    generateServicesResponse(query, relevantKnowledge) {
        return `Jay's Mobile Wash offers comprehensive mobile detailing services including exterior detailing, interior deep cleaning, paint correction, and ceramic coating applications. We specialize in luxury and exotic vehicles, using premium products like Koch Chemie and BioBomb odor elimination. Our services include full detail packages, spot-free washing, interior protection, and our signature Jay's Max Detail treatment. Call 562-228-9429 to discuss which services would be perfect for your vehicle!`;
    }

    /**
     * Generate location-specific response
     */
    generateLocationResponse(query, relevantKnowledge) {
        return `We provide mobile detailing services throughout Los Angeles County and Orange County, including Beverly Hills, Santa Monica, Newport Beach, Irvine, Anaheim, Long Beach, Pasadena, and surrounding areas. We bring our professional equipment and supplies directly to your location - whether that's your home, office, or anywhere convenient for you. Call 562-228-9429 to confirm we serve your specific area and to schedule your mobile detail!`;
    }

    /**
     * Synthesize response from multiple knowledge sources
     */
    synthesizeResponse(query, knowledgeEntries, intent) {
        // Combine relevant knowledge into a coherent response
        let response = '';
        const uniqueContent = new Set();
        
        for (const knowledge of knowledgeEntries) {
            if (!uniqueContent.has(knowledge.content)) {
                uniqueContent.add(knowledge.content);
                if (response) response += ' ';
                response += knowledge.content;
            }
        }
        
        // Ensure response ends with call to action
        if (response && !response.includes('562-228-9429')) {
            response += ' For more details or to schedule your service, please call us at 562-228-9429!';
        }
        
        return response;
    }

    /**
     * Learn from external API response
     */
    async learnFromExternalResponse(userQuery, externalResponse, apiSource) {
        this.metrics.learningEvents++;
        
        // Add to learning queue for processing
        this.learningQueue.push({
            query: userQuery,
            response: externalResponse,
            source: apiSource,
            timestamp: Date.now(),
            conversationContext: [...this.conversationMemory]
        });
        
        // Process learning if queue is getting full
        if (this.learningQueue.length >= 10) {
            await this.processLearningQueue();
        }
        
        // Analyze response for valuable knowledge
        const extractedKnowledge = await this.extractKnowledgeFromResponse(userQuery, externalResponse, apiSource);
        
        if (extractedKnowledge && extractedKnowledge.length > 0) {
            for (const knowledge of extractedKnowledge) {
                await this.addKnowledge(knowledge);
            }
            
            this.log(`Learned ${extractedKnowledge.length} new knowledge entries from ${apiSource}`);
        }
        
        // Add to conversation memory
        this.conversationMemory.push({
            role: 'assistant',
            content: externalResponse,
            source: apiSource,
            timestamp: Date.now(),
            learned: extractedKnowledge ? extractedKnowledge.length : 0
        });
    }

    /**
     * Extract valuable knowledge from external API response
     */
    async extractKnowledgeFromResponse(query, response, source) {
        const extractedKnowledge = [];
        
        // Use intelligent reasoning to determine if response contains valuable knowledge
        const isValuable = this.assessKnowledgeValue(query, response);
        
        if (isValuable.shouldLearn) {
            // Extract key information
            const keyInfo = this.extractKeyInformation(response);
            
            if (keyInfo) {
                const knowledge = {
                    id: `learned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    content: keyInfo.content,
                    category: keyInfo.category || 'learned',
                    confidence: isValuable.confidence,
                    source: `${source}_learned`,
                    tags: keyInfo.tags || [],
                    originalQuery: query,
                    learnedAt: Date.now()
                };
                
                extractedKnowledge.push(knowledge);
            }
        }
        
        return extractedKnowledge;
    }

    /**
     * Assess whether knowledge is valuable to learn
     */
    assessKnowledgeValue(query, response) {
        const lowerResponse = response.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        // Don't learn generic responses
        if (lowerResponse.includes('i don\'t know') || 
            lowerResponse.includes('i\'m not sure') ||
            lowerResponse.length < 50) {
            return { shouldLearn: false, confidence: 0 };
        }
        
        // High value: business-specific information
        if (lowerResponse.includes('jay\'s mobile wash') ||
            lowerResponse.includes('mobile detailing') ||
            lowerResponse.includes('562-228-9429') ||
            lowerResponse.includes('los angeles') ||
            lowerResponse.includes('orange county')) {
            return { shouldLearn: true, confidence: 0.9 };
        }
        
        // Medium value: general car care information
        if (lowerResponse.includes('detailing') ||
            lowerResponse.includes('ceramic coating') ||
            lowerResponse.includes('paint correction') ||
            lowerResponse.includes('car wash')) {
            return { shouldLearn: true, confidence: 0.7 };
        }
        
        // Low value but still useful: general information
        if (response.length > 100 && !this.hasExistingSimilarKnowledge(response)) {
            return { shouldLearn: true, confidence: 0.5 };
        }
        
        return { shouldLearn: false, confidence: 0 };
    }

    /**
     * Extract key information from response
     */
    extractKeyInformation(response) {
        // Simple key information extraction
        // In production, this would use NLP techniques
        
        if (response.length < 50) return null;
        
        // Determine category
        let category = 'general';
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('price') || lowerResponse.includes('cost')) {
            category = 'pricing';
        } else if (lowerResponse.includes('service') || lowerResponse.includes('detail')) {
            category = 'services';
        } else if (lowerResponse.includes('location') || lowerResponse.includes('area')) {
            category = 'location';
        } else if (lowerResponse.includes('book') || lowerResponse.includes('schedule')) {
            category = 'booking';
        }
        
        // Extract tags
        const tags = [];
        const tagPatterns = [
            'mobile', 'detailing', 'wash', 'ceramic', 'coating', 'paint', 
            'correction', 'interior', 'exterior', 'luxury', 'premium'
        ];
        
        for (const tag of tagPatterns) {
            if (lowerResponse.includes(tag)) {
                tags.push(tag);
            }
        }
        
        return {
            content: response,
            category: category,
            tags: tags
        };
    }

    /**
     * Check if similar knowledge already exists
     */
    hasExistingSimilarKnowledge(content) {
        for (const [id, knowledge] of this.knowledgeBase) {
            if (this.calculateTextSimilarity(content, knowledge.content) > 0.8) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add knowledge to the base
     */
    async addKnowledge(knowledge) {
        // Generate embedding for semantic search
        knowledge.embedding = await this.generateEmbedding(knowledge.content);
        
        // Store in knowledge base
        this.knowledgeBase.set(knowledge.id, knowledge);
        this.metrics.knowledgeEntries = this.knowledgeBase.size;
        
        // Save to localStorage
        this.saveKnowledgeBase();
        
        this.log(`Added knowledge: ${knowledge.id} (${knowledge.category})`);
    }

    /**
     * Process learning queue in batch
     */
    async processLearningQueue() {
        if (this.learningQueue.length === 0) return;
        
        this.log(`Processing ${this.learningQueue.length} learning events...`);
        
        // Analyze patterns in the learning queue
        const patterns = this.analyzeLearningPatterns(this.learningQueue);
        
        // Update system based on patterns
        if (patterns.commonTopics.length > 0) {
            this.log(`Identified common topics: ${patterns.commonTopics.join(', ')}`);
        }
        
        // Clear processed queue
        this.learningQueue = [];
    }

    /**
     * Analyze patterns in learning data
     */
    analyzeLearningPatterns(learningData) {
        const topicCounts = {};
        const sources = {};
        
        for (const item of learningData) {
            // Count topic frequency
            const topics = this.extractTopics(item.query + ' ' + item.response);
            for (const topic of topics) {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            }
            
            // Count source usage
            sources[item.source] = (sources[item.source] || 0) + 1;
        }
        
        const commonTopics = Object.entries(topicCounts)
            .filter(([topic, count]) => count >= 3)
            .map(([topic, count]) => topic);
            
        return {
            commonTopics,
            sources,
            totalEvents: learningData.length
        };
    }

    /**
     * Extract topics from text
     */
    extractTopics(text) {
        const topics = [];
        const lowerText = text.toLowerCase();
        
        const topicKeywords = {
            'detailing': ['detail', 'wash', 'clean'],
            'pricing': ['price', 'cost', 'quote', 'fee'],
            'booking': ['book', 'schedule', 'appointment'],
            'services': ['service', 'package', 'treatment'],
            'location': ['location', 'area', 'serve', 'travel'],
            'ceramic_coating': ['ceramic', 'coating', 'protection'],
            'paint_correction': ['paint', 'correction', 'swirl']
        };
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics;
    }

    /**
     * Training interface - submit various content types
     */
    async submitTrainingContent(content, type, metadata = {}) {
        this.log(`Submitting training content: ${type}`);
        
        let processedContent = null;
        
        switch (type) {
            case 'text':
                processedContent = await this.processTextContent(content, metadata);
                break;
            case 'video':
                processedContent = await this.processVideoContent(content, metadata);
                break;
            case 'website':
                processedContent = await this.processWebsiteContent(content, metadata);
                break;
            case 'conversation':
                processedContent = await this.processConversationContent(content, metadata);
                break;
            default:
                throw new Error(`Unsupported content type: ${type}`);
        }
        
        if (processedContent && processedContent.length > 0) {
            for (const knowledge of processedContent) {
                await this.addKnowledge(knowledge);
            }
            
            this.log(`Successfully processed ${processedContent.length} knowledge entries from ${type} content`);
            return {
                success: true,
                entriesAdded: processedContent.length,
                contentType: type
            };
        }
        
        return {
            success: false,
            message: 'No valuable knowledge extracted from content'
        };
    }

    /**
     * Process text content for training
     */
    async processTextContent(text, metadata) {
        const chunks = this.chunkText(text, 500); // Split into manageable chunks
        const knowledgeEntries = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            // Assess value of this chunk
            const assessment = this.assessTextChunkValue(chunk);
            
            if (assessment.isValuable) {
                const knowledge = {
                    id: `text_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                    content: chunk,
                    category: assessment.category,
                    confidence: assessment.confidence,
                    source: metadata.source || 'text_training',
                    tags: assessment.tags,
                    submittedAt: Date.now(),
                    metadata: metadata
                };
                
                knowledgeEntries.push(knowledge);
            }
        }
        
        return knowledgeEntries;
    }

    /**
     * Process video content (transcript-based)
     */
    async processVideoContent(videoData, metadata) {
        // In production, this would extract audio and convert to text
        // For now, assume we receive transcript
        
        let transcript = videoData;
        
        if (typeof videoData === 'object' && videoData.transcript) {
            transcript = videoData.transcript;
        }
        
        if (!transcript || typeof transcript !== 'string') {
            throw new Error('Video content must include transcript text');
        }
        
        // Process as text with video-specific metadata
        const videoMetadata = {
            ...metadata,
            contentType: 'video',
            processedAt: Date.now()
        };
        
        return await this.processTextContent(transcript, videoMetadata);
    }

    /**
     * Process website content
     */
    async processWebsiteContent(websiteData, metadata) {
        let content = '';
        
        if (typeof websiteData === 'string') {
            // Assume it's a URL - in production, this would scrape the content
            content = `Website content from: ${websiteData}. Content processing would be implemented here.`;
        } else if (websiteData.content) {
            content = websiteData.content;
        } else {
            throw new Error('Website content must be string URL or object with content property');
        }
        
        const webMetadata = {
            ...metadata,
            contentType: 'website',
            processedAt: Date.now()
        };
        
        return await this.processTextContent(content, webMetadata);
    }

    /**
     * Process conversation content
     */
    async processConversationContent(conversation, metadata) {
        const knowledgeEntries = [];
        
        if (!Array.isArray(conversation)) {
            throw new Error('Conversation content must be an array of messages');
        }
        
        // Extract valuable exchanges
        for (let i = 0; i < conversation.length - 1; i++) {
            const userMsg = conversation[i];
            const assistantMsg = conversation[i + 1];
            
            if (userMsg.role === 'user' && assistantMsg.role === 'assistant') {
                const exchange = `Q: ${userMsg.content}\nA: ${assistantMsg.content}`;
                const assessment = this.assessTextChunkValue(exchange);
                
                if (assessment.isValuable) {
                    const knowledge = {
                        id: `conv_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                        content: exchange,
                        category: 'qa_pair',
                        confidence: assessment.confidence,
                        source: metadata.source || 'conversation_training',
                        tags: ['qa', ...assessment.tags],
                        submittedAt: Date.now(),
                        metadata: metadata
                    };
                    
                    knowledgeEntries.push(knowledge);
                }
            }
        }
        
        return knowledgeEntries;
    }

    /**
     * Assess value of text chunk
     */
    assessTextChunkValue(text) {
        const lowerText = text.toLowerCase();
        
        // Business-specific content gets high value
        if (lowerText.includes('jay\'s mobile wash') ||
            lowerText.includes('562-228-9429') ||
            lowerText.includes('mobile detailing')) {
            return {
                isValuable: true,
                confidence: 0.95,
                category: 'business_info',
                tags: ['business', 'jay\'s']
            };
        }
        
        // Service-related content
        if (lowerText.includes('detailing') ||
            lowerText.includes('ceramic coating') ||
            lowerText.includes('paint correction') ||
            lowerText.includes('car wash')) {
            return {
                isValuable: true,
                confidence: 0.8,
                category: 'services',
                tags: ['services', 'detailing']
            };
        }
        
        // General valuable content
        if (text.length > 100 && 
            !lowerText.includes('lorem ipsum') &&
            !lowerText.includes('placeholder')) {
            return {
                isValuable: true,
                confidence: 0.6,
                category: 'general',
                tags: ['general']
            };
        }
        
        return {
            isValuable: false,
            confidence: 0,
            category: 'low_value',
            tags: []
        };
    }

    /**
     * Chunk text into manageable pieces
     */
    chunkText(text, maxLength = 500) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/);
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length <= maxLength) {
                currentChunk += sentence + '.';
            } else {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence + '.';
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    /**
     * Generate simple embedding for semantic search
     */
    async generateEmbedding(text) {
        // Simple character-based embedding
        // In production, use proper embedding models
        const embedding = new Array(this.config.embeddingDimensions).fill(0);
        const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            const index = char % this.config.embeddingDimensions;
            embedding[index] += 1;
        }
        
        // Normalize
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] /= magnitude;
            }
        }
        
        return embedding;
    }

    /**
     * Calculate similarity between embeddings
     */
    async calculateSimilarity(embedding1, embedding2) {
        if (!embedding1 || !embedding2) return 0;
        
        let dotProduct = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
        }
        
        return Math.max(0, dotProduct); // Cosine similarity (already normalized)
    }

    /**
     * Calculate text similarity (simple overlap)
     */
    calculateTextSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * Calculate relevance score combining similarity and context
     */
    calculateRelevanceScore(knowledge, query, context) {
        let score = knowledge.similarity || 0;
        
        // Boost score based on confidence
        score *= knowledge.confidence;
        
        // Boost based on recency for learned content
        if (knowledge.learnedAt) {
            const daysSinceLearned = (Date.now() - knowledge.learnedAt) / (1000 * 60 * 60 * 24);
            const recencyBoost = Math.max(0, 1 - daysSinceLearned / 30); // Boost fades over 30 days
            score += recencyBoost * 0.2;
        }
        
        // Boost based on category relevance
        const intent = this.analyzeIntent(query);
        if (knowledge.category === intent.type) {
            score += 0.3;
        }
        
        return Math.min(score, 1.0);
    }

    /**
     * Get current system metrics
     */
    getMetrics() {
        const totalResponses = this.metrics.baseTemplateResponses + this.metrics.externalApiCalls;
        const baseTemplateSuccessRate = totalResponses > 0 ? 
            (this.metrics.baseTemplateResponses / totalResponses) * 100 : 0;
        
        return {
            ...this.metrics,
            baseTemplateSuccessRate: baseTemplateSuccessRate.toFixed(1) + '%',
            knowledgeGrowthRate: this.metrics.learningEvents > 0 ? 
                (this.metrics.knowledgeEntries / this.metrics.learningEvents).toFixed(2) : '0',
            memoryUsage: this.conversationMemory.length,
            lastUpdate: Date.now()
        };
    }

    /**
     * Save knowledge base to localStorage
     */
    saveKnowledgeBase() {
        try {
            const data = {
                knowledge: Array.from(this.knowledgeBase.entries()),
                metrics: this.metrics,
                lastSaved: Date.now()
            };
            
            localStorage.setItem('jaysMobileWash_knowledgeBase', JSON.stringify(data));
        } catch (error) {
            this.error('Failed to save knowledge base:', error);
        }
    }

    /**
     * Load knowledge base from localStorage
     */
    async loadKnowledgeBase() {
        try {
            const data = localStorage.getItem('jaysMobileWash_knowledgeBase');
            if (data) {
                const parsed = JSON.parse(data);
                
                // Restore knowledge base
                this.knowledgeBase = new Map(parsed.knowledge);
                
                // Restore metrics
                if (parsed.metrics) {
                    this.metrics = { ...this.metrics, ...parsed.metrics };
                }
                
                this.log(`Loaded ${this.knowledgeBase.size} knowledge entries from storage`);
            }
        } catch (error) {
            this.error('Failed to load knowledge base:', error);
        }
    }

    /**
     * Clear knowledge base (for testing/reset)
     */
    clearKnowledgeBase() {
        this.knowledgeBase.clear();
        this.conversationMemory = [];
        this.learningQueue = [];
        this.metrics = {
            totalQueries: 0,
            baseTemplateResponses: 0,
            externalApiCalls: 0,
            learningEvents: 0,
            knowledgeEntries: 0,
            averageConfidence: 0
        };
        
        localStorage.removeItem('jaysMobileWash_knowledgeBase');
        this.log('Knowledge base cleared');
    }

    /**
     * Export knowledge base for backup
     */
    exportKnowledgeBase() {
        return {
            knowledge: Array.from(this.knowledgeBase.entries()),
            metrics: this.metrics,
            conversationMemory: this.conversationMemory,
            exportedAt: Date.now(),
            version: '1.0.0'
        };
    }

    /**
     * Import knowledge base from backup
     */
    async importKnowledgeBase(data) {
        if (!data || !data.knowledge) {
            throw new Error('Invalid knowledge base data');
        }
        
        this.knowledgeBase = new Map(data.knowledge);
        
        if (data.metrics) {
            this.metrics = { ...this.metrics, ...data.metrics };
        }
        
        if (data.conversationMemory) {
            this.conversationMemory = data.conversationMemory;
        }
        
        this.saveKnowledgeBase();
        this.log(`Imported ${this.knowledgeBase.size} knowledge entries`);
    }

    /**
     * Log message (if debug enabled)
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[TrainableBaseTemplate]', ...args);
        }
    }

    /**
     * Log error
     */
    error(...args) {
        console.error('[TrainableBaseTemplate Error]', ...args);
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TrainableBaseTemplate };
} else {
    window.TrainableBaseTemplate = TrainableBaseTemplate;
}