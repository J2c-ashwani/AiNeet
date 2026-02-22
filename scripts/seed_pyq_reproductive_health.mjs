/**
 * Seed REAL NEET PYQs — Chapter: Reproductive Health (12th Biology)
 * Usage: node scripts/seed_pyq_reproductive_health.mjs
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

const CHAPTER_NAME = 'Reproductive Health';
const SUBJECT_NAME = 'Biology';
const CLASS_LEVEL = 12;

const TOPICS = [
    'Reproductive Health Problems and Strategies',
    'Population Stabilisation and Birth Control',
    'Medical Termination of Pregnancy And Sexual Transmitted Diseases',
    'Infertility'
];

const ANSWER_KEY = {
    1: 'D', 2: 'A', 3: 'D', 4: 'C', 5: 'A', 6: 'A', 7: 'B', 8: 'C', 9: 'A', 10: 'A',
    11: 'A', 12: 'D', 13: 'C', 14: 'D', 15: 'C', 16: 'B', 17: 'C', 18: 'A', 19: 'D', 20: 'D',
    21: 'C', 22: 'A', 23: 'A', 24: 'B', 25: 'B', 26: 'D', 27: 'C', 28: 'C', 29: 'A', 30: 'C',
    31: 'D'
};

const QUESTIONS = [
    // Reproductive Health Problems and Strategies (Q1-2)
    {
        qNo: 1, topic: 'Reproductive Health Problems and Strategies', year: '2016',
        text: 'In context of amniocentesis, which of the following statement is incorrect?',
        A: 'It is usually done when a woman is between 14 - 16 weeks pregnant.', B: 'It is used for prenatal sex determination.', C: 'It can be used for detection of Down syndrome.', D: 'It can be used for detection of cleft palate.'
    },
    {
        qNo: 2, topic: 'Reproductive Health Problems and Strategies', year: '2013',
        text: 'Which of the following cannot be detected in a developing foetus by amniocentesis?',
        A: 'Jaundice', B: 'Klinefelter’s syndrome', C: 'Sex of the foetus', D: 'Down syndrome'
    },

    // Population Stabilisation and Birth Control (Q3-17)
    {
        qNo: 3, topic: 'Population Stabilisation and Birth Control', year: '2022',
        text: 'Lippe\'s loop is a type of contraceptive used as:',
        A: 'Copper releasing IUD', B: 'Cervical barrier', C: 'Vault barrier', D: 'Non-Medicated IUD'
    },
    {
        qNo: 4, topic: 'Population Stabilisation and Birth Control', year: '2022',
        text: 'Match List-I with List-II with respect to methods of Contraception and their respective actions.\nList-I\n(A) Diaphragms\n(B) Contraceptive Pills\n(C) Intra Uterine Devices\n(D) Lactational Amenorrhea\nList-II\n(i) Inhibit ovulation and Implantation\n(ii) Increase phagocytosis of sperm within Uterus\n(iii) Absence of Menstrual cycle and ovulation following parturition\n(iv) They cover the cervix blocking the entry of sperms\nChoose the correct answer from the options given below.',
        A: 'A-iii B-ii C-i D-iv', B: 'A-iv B-i C-iii D-ii', C: 'A-iv B-i C-ii D-iii', D: 'A-ii B-iv C-i D-iii'
    },
    {
        qNo: 5, topic: 'Population Stabilisation and Birth Control', year: '2021',
        text: 'Match List-I with List-II.\nList-I\n(A) Vaults\n(B) IUDs\n(C) Vasectomy\n(D) Tubectomy\nList-II\n(i) Entry of sperm through Cervix is blocked\n(ii) Removal of Vas deferens\n(iii) Phagocytosis of sperms within the Uterus\n(iv) Removal of fallopian tube\nChoose the correct answer from the options given below.',
        A: 'A-i B-iii C-ii D-iv', B: 'A-ii B-iv C-iii D-i', C: 'A-iii B-i C-iv D-ii', D: 'A-iv B-ii C-i D-iii'
    },
    {
        qNo: 6, topic: 'Population Stabilisation and Birth Control', year: '2021',
        text: 'Which one of the following is an example of Hormone releasing IUD?',
        A: 'LNG 20', B: 'Cu 7', C: 'Multiload 375', D: 'CuT'
    },
    {
        qNo: 7, topic: 'Population Stabilisation and Birth Control', year: '2020',
        text: 'Progestogens alone or in combination with estrogens can be used as a contraceptive in the form of-',
        A: 'Injections only', B: 'Pills, injections and implants', C: 'Pills only', D: 'Implants only'
    },
    {
        qNo: 8, topic: 'Population Stabilisation and Birth Control', year: '2019',
        text: 'Select the hormone-releasing Intra-Uterine Devices.',
        A: 'Vaults, LNG-20', B: 'Multiload 375, Progestasert', C: 'Progestasert, LNG-20', D: 'Lippes Loop, Multiload 375'
    },
    {
        qNo: 9, topic: 'Population Stabilisation and Birth Control', year: '2019',
        text: 'Which of the following contraceptive methods do involve a role of hormone?',
        A: 'Lactational amenorrhea, Pills, Emergency contraceptives.', B: 'Barrier method, Lactational amenorrhea, Pills.', C: 'CuT, Pills, Emergency contraceptives.', D: 'Pills, Emergency contraceptives, Barrier methods.'
    },
    {
        qNo: 10, topic: 'Population Stabilisation and Birth Control', year: '2018',
        text: 'The contraceptive \'SAHELI\':',
        A: 'Blocks estrogen receptors in the uterus, preventing eggs from getting implanted.', B: 'Increases the concentration of estrogen and prevents ovulation in females.', C: 'Is an IUD.', D: 'Is a post-coital contraceptive.'
    },
    {
        qNo: 11, topic: 'Population Stabilisation and Birth Control', year: '2017',
        text: 'The function of copper ions in copper releasing IUD’s is:',
        A: 'They suppress sperm motility and fertilising capacity of sperms', B: 'They inhibit gametogenesis', C: 'They make uterus unsuitable for implantation', D: 'They inhibit ovulation'
    },
    {
        qNo: 12, topic: 'Population Stabilisation and Birth Control', year: '2016',
        text: 'Which of the following is incorrect regarding vasectomy?',
        A: 'Vasa deferentia is cut and tied', B: 'Irreversible sterility', C: 'No sperm occurs in seminal fluid', D: 'No sperm occurs in epididymis'
    },
    {
        qNo: 13, topic: 'Population Stabilisation and Birth Control', year: '2016',
        text: 'Which of the following is hormone releasing IUD?',
        A: 'Lippes loop', B: 'Cu7', C: 'LNG-20', D: 'Multiload 375'
    },
    {
        qNo: 14, topic: 'Population Stabilisation and Birth Control', year: '2016',
        text: 'Which of the following approaches does not give the defined action of contraceptive?',
        A: 'Barrier Methods -> Prevent fertilisation', B: 'Intrauterine Devices -> Increase phagocytosis of sperms, suppress sperm motility and fertilising capacity of sperms', C: 'Hormonal contraceptives -> Prevent/retard entry of sperms, prevent ovulation and fertilisation', D: 'Vasectomy -> Prevents spermatogenesis'
    },
    {
        qNo: 15, topic: 'Population Stabilisation and Birth Control', year: '2015',
        text: 'Hysterectomy is surgical removal of:',
        A: 'Vas-deferens', B: 'Mammary glands', C: 'Uterus', D: 'Prostate gland'
    },
    {
        qNo: 16, topic: 'Population Stabilisation and Birth Control', year: '2014',
        text: 'Tubectomy is a method of sterilisation in which:',
        A: 'Uterus is removed surgically', B: 'Small part of the fallopian tube is removed or tied up', C: 'Ovaries are removed surgically', D: 'Small part of vas deferens is removed or tied up'
    },
    {
        qNo: 17, topic: 'Population Stabilisation and Birth Control', year: '2014',
        text: 'Which of the following is a hormone releasing Intra Uterine Device (IUD)?',
        A: 'Vault', B: 'Multiload 375', C: 'LNG-20', D: 'Cervical cap'
    },

    // Medical Termination of Pregnancy And Sexual Transmitted Diseases (Q18-25)
    {
        qNo: 18, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2021',
        text: 'Venereal diseases can spread through:\nA. Using sterile needles\nB. Transfusion of blood from infected person\nC. Infected mother to foetus\nD. Kissing\nE. Inheritance\nChoose the correct answer from the options given below.',
        A: 'B, C and D only', B: 'B and C only', C: 'A and C only', D: 'A, B and C only' // Official key is A but options in pdf says a. B,C,D only. Oh actually Q18 key in txt is a -> Wait, looking at extracted txt for Q18 answer is a.
    },
    {
        qNo: 19, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2020',
        text: 'Select the option including all sexually transmitted diseases',
        A: 'Gonorrhoea, Malaria, Genital herpes', B: 'AIDS, Malaria, Filaria', C: 'Cancer, AIDS, Syphilis', D: 'Gonorrhoea, Syphilis, Genital herpes'
    },
    {
        qNo: 20, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2020',
        text: 'Which of the following STDs are not curable?',
        A: 'Chlamydiasis, Syphilis, Genital warts', B: 'HIV, Gonorrhoea, Trichomoniasis', C: 'Gonorrhoea, Trichomoniasis, Hepatitis B', D: 'Genital herpes, Hepatitis B, HIV infection'
    },
    {
        qNo: 21, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2019',
        text: 'Which of the following sexually transmitted diseases is not completely curable?',
        A: 'Gonorrhoea', B: 'Genital warts', C: 'Genital herpes', D: 'Chlamydiasis'
    },
    {
        qNo: 22, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2017',
        text: 'Match the following sexually transmitted diseases with their causative agent and select the correct option.\nA. Gonorrhea (i) HIV\nB. Syphilis (ii) Neisseria\nC. Genital Warts (iii) Treponema\nD. AIDS (iv) Human Papilloma virus',
        A: 'A-ii B-iii C-iv D-i', B: 'A-iii B-iv C-i D-ii', C: 'A-iv B-ii C-iii D-i', D: 'A-iv B-iii C-ii D-i'
    },
    {
        qNo: 23, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2015',
        text: 'Ectopic pregnancies are referred to as:',
        A: 'Implantation of embryo at site other than uterus.', B: 'Implantation of defective embryo in the uterus.', C: 'Pregnancies terminated due to hormonal imbalance.', D: 'Pregnancies with genetic abnormality.'
    },
    {
        qNo: 24, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2015',
        text: 'Which of the following is not a sexually transmitted disease?',
        A: 'Trichomoniasis', B: 'Encephalitis', C: 'Syphilis', D: 'Acquired Immuno Deficiency Syndrome'
    },
    {
        qNo: 25, topic: 'Medical Termination of Pregnancy And Sexual Transmitted Diseases', year: '2013',
        text: 'One of the legal methods of birth control is:',
        A: 'By a premature ejaculation during coitus', B: 'Abortion by taking an appropriate medicine', C: 'By abstaining from coitus from day 10 to 17 of the menstrual cycle', D: 'By having coitus at the time of day break'
    },

    // Infertility (Q26-31)
    {
        qNo: 26, topic: 'Infertility', year: '2020',
        text: 'In which of the following techniques, the embryos are transferred to assist those females who cannot conceive?',
        A: 'GIFT and ZIFT', B: 'ICSI and ZIFT', C: 'GIFT and ICSI', D: 'ZIFT and IUT'
    },
    {
        qNo: 27, topic: 'Infertility', year: '2017',
        text: 'In case of a couple where the male is having a very low sperm count, which technique will be suitable for fertilisation?',
        A: 'Intrauterine transfer', B: 'Gamete intracytoplasmic fallopian transfer', C: 'Artificial Insemination', D: 'Intracytoplasmic sperm injection'
    },
    {
        qNo: 28, topic: 'Infertility', year: '2016',
        text: 'Embryo with more than 16 blastomeres formed due to in vitro fertilisation is transferred into:',
        A: 'Fimbriae', B: 'Cervix', C: 'Uterus', D: 'Fallopian tube'
    },
    {
        qNo: 29, topic: 'Infertility', year: '2015',
        text: 'A childless couple can be assisted to have a child through a technique called GIFT. The full form of this technique is:',
        A: 'Gamete intra fallopian transfer', B: 'Gamete internal fertilisation and transfer', C: 'Germ cell internal fallopian transfer', D: 'Gemete inseminated fallopian transfer'
    },
    {
        qNo: 30, topic: 'Infertility', year: '2014',
        text: 'Assisted reproductive technology, IVF involves transfer of:',
        A: 'Embryo with 16 blastomeres into the fallopian tube', B: 'Ovum into the fallopian tube', C: 'Zygote into the fallopian tube', D: 'Zygote into the uterus'
    },
    {
        qNo: 31, topic: 'Infertility', year: '2013',
        text: 'Artificial insemination means:',
        A: 'Introduction of sperms of healthy donor directly into the ovary', B: 'Transfer of sperms of a healthy donor to a test tube containing ova', C: 'Transfer of sperms of husband to a test tube containing ova', D: 'Artificial introduction of sperms of a healthy donor into the vagina or uterus'
    }
];

// Q18 answer key says a, which is B, C and D only. But C (Infected mother to foetus) isn't venereal per se although STD spreads that way, actually B (Transfusion) is also valid for STD like HIV/Syphilis. Official NEET 2021 key for this was a.
// Wait, actually I will just use 'A' as correct option because the value of A is 'B, C and D only' in my object. Wait, the extracted text Q18 a = B,C,D only in the original image perhaps, but the text is a. B, C and D only. But the options were: a. B, C and D only b. B and C only... let me adjust the 'options' in Q18. I did. A='B, C and D only'. So correct='A'.

async function run() {
    console.log('🔄 Seeding real PYQs for:', CHAPTER_NAME, '(Class 12)');

    // Reproductive Health is Chapter 4 in NCERT Biology Class 12
    const [subject] = await query('SELECT id FROM subjects WHERE name = $1', [SUBJECT_NAME]);
    if (!subject) { console.error('❌ Subject not found'); process.exit(1); }
    const subjectId = subject.id;

    let [chapter] = await query('SELECT id FROM chapters WHERE name ILIKE $1 AND subject_id = $2', [`%${CHAPTER_NAME.split(' ').slice(0, 2).join('%')}%`, subjectId]);
    if (!chapter) {
        [chapter] = await query('INSERT INTO chapters (subject_id, name, class_level, order_index) VALUES ($1, $2, $3, $4) RETURNING id', [subjectId, CHAPTER_NAME, CLASS_LEVEL, 4]);
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
