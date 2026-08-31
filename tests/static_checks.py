from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
idx=(root/'index.html').read_text(encoding='utf-8'); cloud=(root/'js/cloud.js').read_text(encoding='utf-8'); schema=(root/'supabase/schema.sql').read_text(encoding='utf-8'); edge=(root/'supabase/functions/grade-exam/index.ts').read_text(encoding='utf-8')
checks={
 'manifest':(root/'manifest.webmanifest').exists(), 'service_worker':(root/'service-worker.js').exists(), 'admin':(root/'admin/index.html').exists(), 'verify':(root/'verificar/index.html').exists(),
 '26_images':len(list((root/'images').glob('*')))==26,
 'no_admin_button_participant':'Panel de administrador' not in idx and 'Administrador</button>' not in idx,
 'no_admin_password':'ADMIN_PASS' not in idx and 'ADMIN_USER' not in idx,
 'no_localStorage_official':'localStorage' not in cloud,
 '20_exam_questions':idx.count('{q:"')>=20,
 'answer_key_not_html':'ANSWER_KEY' not in idx,
 'answer_key_edge':'ANSWER_KEY' in edge,
 'unique_certificate':'unique(user_id,course_code)' in schema,
 'rls':'enable row level security' in schema.lower(),
 'activity_gate':'required_activities' in schema and 'complete_activity' in schema,
 'ga4':'GA4_MEASUREMENT_ID' in (root/'config.js').read_text(),
}
for k,v in checks.items():print(('PASS' if v else 'FAIL'),k)
if not all(checks.values()):sys.exit(1)
