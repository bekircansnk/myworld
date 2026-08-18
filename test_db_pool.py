import sys
sys.path.append('app/backend')
from app.database import engine
print(engine.pool.size())
