from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class UserCompanyAccess(Base):
    """Kullanıcı-Firma erişim tablosu: hangi kullanıcı hangi firmaya erişebilir"""
    __tablename__ = "user_company_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Kim verdi
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Aynı kullanıcı aynı firmaya iki kez atanamaz
    __table_args__ = (UniqueConstraint('user_id', 'project_id', name='uq_user_company'),)

    user = relationship("User", foreign_keys=[user_id], backref="company_accesses")
    project = relationship("Project", backref="user_accesses")
    granter = relationship("User", foreign_keys=[granted_by])
