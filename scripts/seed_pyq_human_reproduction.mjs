/**
 * Seed REAL NEET PYQs — Chapter: Human Reproduction (12th Biology)
 * Usage: node scripts/seed_pyq_human_reproduction.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function query(sql, params = []) { const { rows } = await pool.query(sql, params); return rows; }

const CHAPTER_NAME = 'Human Reproduction'; // Chapter 3 in NCERT Biology Class 12
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Male Reproductive System',
    'Female Reproductive System',
    'Gametogenesis',
    'Menstrual Cycle',
    'Fertilisation and Implantation',
    'Pregnancy and Embryonic Development',  // Note: Combined Fertilisation etc. into standard topics based on PDF headers
    'Parturition and Lactation'
];

const ANSWER_KEY = {
    1: 'B', 2: 'C', 3: 'A', 4: 'D', 5: 'C', 6: 'A', 7: 'C', 8: 'C', 9: 'C', 10: 'A',
    11: 'A', 12: 'D', 13: 'A', 14: 'A', 15: 'D', 16: 'C', 17: 'A', 18: 'D', 19: 'B', 20: 'C',
    21: 'A', 22: 'A', 23: 'C', 24: 'A', 25: 'D', 26: 'B', 27: 'B', 28: 'A', 29: 'C', 30: 'D',
    31: 'C', 32: 'B'
};

const QUESTIONS = [
    // Male Reproductive System
    {
        qNo: 1, topic: 'Male Reproductive System', year: '2019',
        text: 'Select the correct sequence for transport of sperm cells in male reproductive system.',
        A: 'Testis → Epididymis → Vasa efferentia → Rete testis → Inguinal canal → Urethra', B: 'Seminiferous tubules → Rete testis → Vasa efferentia → Epididymis → Vas deferens → Ejaculatory duct → Urethra → Urethral meatus', C: 'Seminiferous tubules → Vasa efferentia → Epididymis → Inguinal canal → Urethra', D: 'Testis → Epididymis → Vasa efferentia → Vas deferens → Ejaculatory duct → Inguinal canal → Urethra → Urethral meatus'
    },
    {
        qNo: 2, topic: 'Male Reproductive System', year: '2016',
        text: 'Which of the following depicts the correct pathway of transport of sperms?',
        A: 'Rete testis → Vas deferens → Efferent ductules → Epididymis', B: 'Efferent ductules → Rete testis → Vas deferens → Epididymis', C: 'Rete testis → Efferent ductules → Epididymis → Vas deferens', D: 'Rete testis → Epididymis → Efferent ductules → Vas deferens'
    },
    {
        qNo: 3, topic: 'Male Reproductive System', year: '2015',
        text: 'The shared terminal duct of the reproductive and urinary system in the human male is:',
        A: 'Urethra', B: 'Ureter', C: 'Vas deferens', D: 'Vasa efferentia'
    },

    // Female Reproductive System
    {
        qNo: 4, topic: 'Female Reproductive System', year: '2017',
        text: 'Capacitation occurs in:',
        A: 'Rete testis', B: 'Epididymis', C: 'Vas deferens', D: 'Female Reproductive tract'
    },
    {
        qNo: 5, topic: 'Female Reproductive System', year: '2015',
        text: 'Capacitation refers to changes in the:',
        A: 'Ovum after fertilisation', B: 'Sperm after fertilisation', C: 'Sperm before fertilisation', D: 'Ovum before fertilisation'
    },

    // Gametogenesis
    {
        qNo: 6, topic: 'Gametogenesis', year: '2022',
        text: 'Which of the following statements are true for spermatogenesis but do not hold true for Oogensis?\nA. It results in the formation of haploid gametes\nB. Differentiation of gamete occurs after the completion of meiosis\nC. Meiosis occurs continuously in a mitotically dividing stem cell population\nD. It is controlled by the Luteinising hormone (LH) and Follicle Stimulating Hormone (FSH) secreted by the anterior pituitary\nE. It is initiated at puberty\nChoose the most appropriate answer from the options given below.',
        A: 'B, C and E only', B: 'C and E only', C: 'B and C only', D: 'B, D and E only'
    },
    {
        qNo: 7, topic: 'Gametogenesis', year: '2022',
        text: 'At which stage of life the oogenesis process is initiated?',
        A: 'Adult', B: 'Puberty', C: 'Embryonic development stage', D: 'Birth'
    },
    {
        qNo: 8, topic: 'Gametogenesis', year: '2022',
        text: 'Given below are two statements:\nStatement I: The release of sperms into the seminiferous tubules is called spermiation\nStatement II: Spermiogenesis is the process of formation of sperms from spermatogonia\nIn the light of the above statements, choose the most appropriate answer from the options given below.',
        A: 'Statement I is incorrect but Statement II is correct', B: 'Both Statement I and Statement II are correct', C: 'Both statement I and statement II are incorrect', D: 'Statement I is correct but Statement II is incorrect'
    },
    {
        qNo: 9, topic: 'Gametogenesis', year: '2020',
        text: 'Meiotic division of the secondary oocyte is completed:',
        A: 'At the time of copulation', B: 'After zygote formation', C: 'At the time of fusion of a sperm with an ovum', D: 'Prior to ovulation'
    },
    {
        qNo: 10, topic: 'Gametogenesis', year: '2020',
        text: 'Select the correct option of haploid cells from the following groups:',
        A: 'Secondary spermatocyte, First polar body, Ovum', B: 'Spermatogonia, Primary spermatocyte, Spermatid', C: 'Primary spermatocyte, Secondary spermatocyte, Second polar body', D: 'Primary oocyte, Secondary oocyte, Spermatid'
    },
    {
        qNo: 11, topic: 'Gametogenesis', year: '2019',
        text: 'Extrusion of second polar body from egg nucleus occurs:',
        A: 'After entry of sperm but before fertilisation', B: 'After fertilisation', C: 'Before entry of sperm into ovum', D: 'Simultaneously with first cleavage'
    },
    {
        qNo: 12, topic: 'Gametogenesis', year: '2018',
        text: 'The difference between spermiogenesis and spermiation is:',
        A: 'In spermiogenesis spermatids are formed, while in spermiation spermatozoa are formed.', B: 'In spermiogenesis spermatozoa are formed, while in spermiation spermatids are formed.', C: 'In spermiogenesis spermatozoa from Sertoli cells are released into the cavity of seminiferous tubules, while in spermiation spermatozoa are formed.', D: 'In spermiogenesis spermatozoa are formed, while in spermiation spermatozoa are released from Sertoli cells into the cavity of seminiferous tubules.'
    }, // Corrected D. D describes spermatozoa formed from spermatids (spermiogenesis) and release from sertoli (spermiation)
    {
        qNo: 13, topic: 'Gametogenesis', year: '2015',
        text: 'Which of the following cells during gametogenesis is normally diploid?',
        A: 'Spermatogonia', B: 'Secondary polar body', C: 'Primary polar body', D: 'Spermatid'
    },
    {
        qNo: 14, topic: 'Gametogenesis', year: '2013',
        text: 'What is the correct sequence of sperm formation?',
        A: 'Spermatogonia, Spermatocyte, Spermatid, Spermatozoa', B: 'Spermatid, Spermatocyte, Spermatogonia, Spermatozoa', C: 'Spermatogonia, Spermatocyte, Spermatozoa, Spermatid', D: 'Spermatogonia, Spermatozoa, Spermatocyte, Spermatid'
    },

    // Menstrual Cycle
    {
        qNo: 15, topic: 'Menstrual Cycle', year: '2020',
        text: 'Which of the following hormone levels will cause release of ovum (ovulation) from the graffian follicle?',
        A: 'High concentration of Progesterone', B: 'Low concentration of LH', C: 'Low concentration of FSH', D: 'High concentration of Estrogen'
    },
    {
        qNo: 16, topic: 'Menstrual Cycle', year: '2017',
        text: 'A temporary endocrine gland in the human body is:',
        A: 'Pineal gland', B: 'Corpus cardiacum', C: 'Corpus luteum', D: 'Corpus allatum'
    },
    {
        qNo: 17, topic: 'Menstrual Cycle', year: '2016',
        text: 'Changes in GnRH pulse frequency in females is controlled by circulating levels of:',
        A: 'Estrogen and progesterone', B: 'Estrogen and inhibin', C: 'Progesterone only', D: 'Progesterone and inhibin'
    },
    {
        qNo: 18, topic: 'Menstrual Cycle', year: '2015',
        text: 'Which of the following events is not associated with ovulation in human female?',
        A: 'Full development of Graafian follicle', B: 'Release of secondary oocyte', C: 'LH surge', D: 'Decrease in estradiol'
    },
    {
        qNo: 19, topic: 'Menstrual Cycle', year: '2013',
        text: 'Menstrual flow occurs due to lack of:',
        A: 'Vasopressin', B: 'Progesterone', C: 'FSH', D: 'Oxytocin'
    },

    // Fertilisation and Implantation & Pregnancy and Embryonic Development (Using Pregnancy and Embryonic Development for 21-25, Fert for 20, 26-30)
    {
        qNo: 20, topic: 'Fertilisation and Implantation', year: '2021',
        text: 'Receptors for sperm binding in mammals are present on:',
        A: 'Vitelline membrane', B: 'Perivitelline space', C: 'Zona pellucida', D: 'Corona radiata'
    },
    {
        qNo: 21, topic: 'Pregnancy and Embryonic Development', year: '2021',
        text: 'Which of the following secretes the hormone, relaxin during the later phase of pregnancy?',
        A: 'Corpus luteum', B: 'Foetus', C: 'Uterus', D: 'Graafian follicle'
    },
    {
        qNo: 22, topic: 'Pregnancy and Embryonic Development', year: '2020',
        text: 'In human beings, at the end of 12 weeks (first trimester) of pregnancy, the following is observed:',
        A: 'Most of the major organ systems are formed', B: 'The head is covered with fine hair', C: 'Movement of the foetus', D: 'Eyelids and eyelashes are formed'
    },
    {
        qNo: 23, topic: 'Pregnancy and Embryonic Development', year: '2018',
        text: 'Hormones secreted by the placenta to maintain pregnancy are:',
        A: 'hCG, hPL, progestogens, prolactin', B: 'hCG, hPL, estrogens, relaxin, oxytocin', C: 'hCG, hPL, progestogens, estrogens', D: 'hCG, progestogens, estrogens, glucocorticoids'
    },
    {
        qNo: 24, topic: 'Pregnancy and Embryonic Development', year: '2018',
        text: 'The amnion of mammalian embryo is derived from',
        A: 'Ectoderm and mesoderm', B: 'Endoderm and mesoderm', C: 'Mesoderm and trophoblast', D: 'Ectoderm and endoderm'
    },
    {
        qNo: 25, topic: 'Pregnancy and Embryonic Development', year: '2016',
        text: 'Several hormones like hCG, hPL, estrogen, progesterone are produced by:',
        A: 'Fallopian tube', B: 'Pituitary', C: 'Ovary', D: 'Placenta'
    },
    {
        qNo: 26, topic: 'Pregnancy and Embryonic Development', year: '2016',
        text: 'Identify the correct statement on inhibin:',
        A: 'Inhibits the secretion of LH, FSH and Prolactin', B: 'Is produced by granulose cells in ovary and inhibits the secretion of FSH', C: 'Is produced by granulose cells in ovary and inhibits the secretion of LH', D: 'Is produced by nurse cells in testes and inhibits the secretion of LH'
    }, // Technically inhibin is reproductive system / menstrual cycle but placed here in numbering
    {
        qNo: 27, topic: 'Fertilisation and Implantation', year: '2016',
        text: 'Fertilisation in humans is practically feasible only if:',
        A: 'The sperms are transported into vagina just after the release of ovum in fallopian tube', B: 'The ovum and sperms are transported simultaneously to ampullary - isthmic junction of the fallopian tube', C: 'The ovum and sperms are transported simultaneously to ampullary - isthmic junction of the cervix', D: 'The sperms are transported into cervix within 48 hrs of release of ovum in uterus'
    }, // Answer is B
    {
        qNo: 28, topic: 'Fertilisation and Implantation', year: '2015',
        text: 'In human females, meiosis-II in not complete until',
        A: 'Fertilisation', B: 'Uterine implantation', C: 'Birth', D: 'Puberty'
    },
    {
        qNo: 29, topic: 'Gametogenesis', year: '2015',
        text: 'Which of the following layers in an antral follicle is acelluar?',
        A: 'Theca interna', B: 'Stroma', C: 'Zona pellucida', D: 'Granulosa'
    }, // Antral follicle is part of oogenesis
    {
        qNo: 30, topic: 'Pregnancy and Embryonic Development', year: '2014',
        text: 'Select the correct option describing gonadotropin activity in a normal pregnant female:',
        A: 'High level of hCG stimulates the thickening of endometrium', B: 'High level of FSH and LH stimulates the thickening of endometrium', C: 'High level of FSH and LH facilitate implantation of the embryo', D: 'High level of hCG stimulates the synthesis of estrogen and progesterone'
    },

    // Parturition and Lactation
    {
        qNo: 31, topic: 'Parturition and Lactation', year: '2021',
        text: 'Which of these is not an important component of initiation of parturition in humans?',
        A: 'Synthesis of prostaglandins', B: 'Release of Oxytocin', C: 'Release of Prolactin', D: 'Increase in estrogen and progesterone ratio'
    },
    {
        qNo: 32, topic: 'Parturition and Lactation', year: '2015',
        text: 'Which of these is not an important component of initiation of parturition in humans?',
        A: 'Release of oxytocin', B: 'Release of prolactin', C: 'Increase in estrogen and progesterone ratio', D: 'Synthesis of prostaglandins'
    }
];

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Human Reproduction is Chapter 3 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 3]);
    }
    const chapterId = chapter.id;
    console.log(`  Chapter: ${CHAPTER_NAME} (id=${chapterId})`);

    const topicMap = {};
    for (const topicName of TOPICS) {
        let [topic] = await query('SELECT id FROM topics WHERE name = $1 AND chapter_id = $2', [topicName, chapterId]);
        if (!topic) {
            [topic] = await query('INSERT INTO topics (chapter_id, name, weightage) VALUES ($1, $2, $3) RETURNING id', [chapterId, topicName, 1]);
        }
        topicMap[topicName] = topic.id;
        console.log(`  Topic: ${topicName} (id=${topic.id})`);
    }

    const deleted = await query('DELETE FROM questions WHERE chapter_id = $1 AND is_pyq = 1 RETURNING id', [chapterId]);
    console.log(`  🗑️  Deleted ${deleted.length} old PYQs`);

    let inserted = 0;
    for (const q of QUESTIONS) {
        let correctAnswer = ANSWER_KEY[q.qNo];
        const topicId = topicMap[q.topic];
        if (!topicId) { console.error(`  ❌ Topic not found for Q${q.qNo}: "${q.topic}"`); continue; }

        await query(`INSERT INTO questions (topic_id, chapter_id, subject_id, text, option_a, option_b, option_c, option_d, correct_option, difficulty, explanation, is_pyq, exam_name, year_asked, tags, verification_status, quality_score) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            [topicId, chapterId, subjectId, q.text, q.A, q.B, q.C, q.D, correctAnswer, 'medium', null, 1, 'NEET', q.year, 'pyq,neet,real', 'verified', 10.0]);
        inserted++;
    }

    console.log(`\n✅ Inserted ${inserted} real NEET PYQs for "${CHAPTER_NAME}"`);

    const topicCounts = await query(`SELECT t.name, COUNT(*) as count FROM questions q JOIN topics t ON q.topic_id = t.id WHERE q.chapter_id = $1 AND q.is_pyq = 1 GROUP BY t.name ORDER BY count DESC`, [chapterId]);
    console.log('\n📋 By topic:');
    for (const tc of topicCounts) console.log(`   ${tc.name}: ${tc.count} questions`);

    await pool.end();
}

run().catch(err => { console.error(err); pool.end(); process.exit(1); });
